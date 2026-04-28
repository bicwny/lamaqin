#!/usr/bin/env node
/**
 * seed-reviewer-account.js
 *
 * Creates (or updates) the App Store Connect reviewer demo account in
 * Supabase and seeds it with realistic data so the Apple reviewer sees a
 * fully populated app on first sign-in.
 *
 * The app uses email-OTP login (no passwords), so the developer must forward
 * the OTP to the reviewer manually. The password set on the auth user is kept
 * only as a future-proof credential and is not used by the current app.
 *
 * Required env vars:
 *   EXPO_PUBLIC_SUPABASE_URL       Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY      Supabase service-role key (NOT the anon key)
 *
 * Optional env vars:
 *   REVIEWER_EMAIL                 Default: appstore-review@bicwny.com
 *   REVIEWER_PASSWORD              Default: random 24-char string printed at end
 *   REVIEWER_DHARMA_NAME           Default: 审核测试
 *   REVIEWER_CLASS_NAME            Default: 加行  (covers count + session/time practices)
 *   REVIEWER_ENTRY_YEAR            Default: current year
 *   SEED_DAYS                      Default: 14   (days of practice history to seed)
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-reviewer-account.js
 *
 * The script is idempotent: re-running it will keep the same auth user, refresh
 * the profile/enrollment, and replace the seeded practice history.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('   Get the service-role key from Supabase Dashboard → Settings → API.');
  process.exit(1);
}

const REVIEWER_EMAIL = process.env.REVIEWER_EMAIL || 'appstore-review@bicwny.com';
const REVIEWER_PASSWORD =
  process.env.REVIEWER_PASSWORD ||
  crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, '').slice(0, 24);
const REVIEWER_DHARMA_NAME = process.env.REVIEWER_DHARMA_NAME || '审核测试';
const REVIEWER_CLASS_NAME = process.env.REVIEWER_CLASS_NAME || '加行';
const REVIEWER_ENTRY_YEAR =
  process.env.REVIEWER_ENTRY_YEAR || String(new Date().getFullYear());
const SEED_DAYS = Math.max(1, parseInt(process.env.SEED_DAYS || '14', 10));

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function findUserByEmail(email) {
  // listUsers is paginated; loop until found or exhausted.
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
    if (page > 50) return null; // safety
  }
}

async function createOrUpdateAuthUser() {
  const existing = await findUserByEmail(REVIEWER_EMAIL);
  if (existing) {
    console.log(`ℹ️  Auth user already exists: ${existing.id}`);
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: REVIEWER_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    return existing;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: REVIEWER_EMAIL,
    password: REVIEWER_PASSWORD,
    email_confirm: true,
    user_metadata: { dharma_name: REVIEWER_DHARMA_NAME },
  });
  if (error) throw error;
  console.log(`✅ Created auth user: ${data.user.id}`);
  return data.user;
}

async function upsertProfile(userId) {
  const { error } = await admin.from('users').upsert(
    {
      id: userId,
      email: REVIEWER_EMAIL,
      dharma_name: REVIEWER_DHARMA_NAME,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );
  if (error) throw new Error(`upsert users: ${error.message}`);
  console.log(`✅ Profile upserted with dharma_name: ${REVIEWER_DHARMA_NAME}`);
}

async function getClassByName(name) {
  const { data, error } = await admin
    .from('class_curricula')
    .select('id, class_name')
    .eq('class_name', name)
    .single();
  if (error) throw new Error(`Class "${name}" not found: ${error.message}`);
  return data;
}

async function enrollInClass(userId, classId) {
  const { data: existing, error: findErr } = await admin
    .from('user_enrolled_classes')
    .select('id')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .maybeSingle();
  if (findErr) throw new Error(`find enrollment: ${findErr.message}`);
  if (existing) {
    const { error } = await admin
      .from('user_enrolled_classes')
      .update({ status: 'active', entry_year: REVIEWER_ENTRY_YEAR })
      .eq('id', existing.id);
    if (error) throw new Error(`update enrollment: ${error.message}`);
  } else {
    const { error } = await admin.from('user_enrolled_classes').insert({
      user_id: userId,
      class_id: classId,
      status: 'active',
      entry_year: REVIEWER_ENTRY_YEAR,
    });
    if (error) throw new Error(`insert enrollment: ${error.message}`);
  }
  const { error: progErr } = await admin.from('user_class_progress').upsert(
    {
      user_id: userId,
      class_id: classId,
      courses_completed: 0,
      practices_completed: 0,
      overall_progress_percentage: 0,
    },
    { onConflict: 'user_id,class_id' },
  );
  if (progErr) throw new Error(`upsert user_class_progress: ${progErr.message}`);
  console.log(`✅ Enrolled in class: ${REVIEWER_CLASS_NAME} (${REVIEWER_ENTRY_YEAR})`);
}

async function joinRequiredCourses(userId, classId) {
  const { data: links, error } = await admin
    .from('class_required_courses')
    .select('course_id')
    .eq('class_id', classId);
  if (error) throw error;

  const today = new Date().toISOString().split('T')[0];
  for (const link of links || []) {
    const { error: upErr } = await admin
      .from('user_courses')
      .upsert(
        {
          user_id: userId,
          course_id: link.course_id,
          status: 'active',
          joined_date: today,
        },
        { onConflict: 'user_id,course_id' },
      );
    if (upErr) throw new Error(`upsert user_courses ${link.course_id}: ${upErr.message}`);
  }
  console.log(`✅ Joined ${links?.length || 0} required course(s)`);
  return (links || []).map((l) => l.course_id);
}

async function createPracticeProjects(userId, classId) {
  const { data: required, error } = await admin
    .from('class_required_practices')
    .select(`
      practice_id,
      total_target,
      daily_target,
      weekly_target,
      practice_category,
      is_optional,
      practice:practices(id, name, type, unit)
    `)
    .eq('class_id', classId);
  if (error) throw error;

  const today = new Date().toISOString().split('T')[0];
  const projects = [];
  for (const req of required || []) {
    if (req.is_optional) continue; // skip choice-group practices in seed
    const base = {
      user_id: userId,
      practice_id: req.practice_id,
      total_target: req.total_target,
      daily_target: req.practice_category === 'session' ? null : req.daily_target,
      weekly_target: req.practice_category === 'session' ? req.weekly_target : null,
      current_count: 0,
      status: 'active',
      start_date: today,
      target_period: req.practice_category === 'session' ? 'weekly' : 'daily',
      source_type: 'class_required',
    };
    if (req.total_target && req.daily_target && req.practice_category !== 'session') {
      const days = Math.ceil(req.total_target / req.daily_target);
      const end = new Date();
      end.setDate(end.getDate() + days - 1);
      base.target_end_date = end.toISOString().split('T')[0];
    }
    projects.push({ project: base, meta: req });
  }

  const created = [];
  for (const { project, meta } of projects) {
    const { data: existing, error: findErr } = await admin
      .from('user_practice_projects')
      .select('id')
      .eq('user_id', userId)
      .eq('practice_id', project.practice_id)
      .eq('source_type', 'class_required')
      .maybeSingle();
    if (findErr) throw new Error(`find practice project: ${findErr.message}`);

    let projectId;
    if (existing) {
      projectId = existing.id;
      const { error: updErr } = await admin
        .from('user_practice_projects')
        .update({ ...project, current_count: 0 })
        .eq('id', projectId);
      if (updErr) throw new Error(`update practice project: ${updErr.message}`);
    } else {
      const { data, error: insErr } = await admin
        .from('user_practice_projects')
        .insert(project)
        .select('id')
        .single();
      if (insErr) throw new Error(`insert practice project: ${insErr.message}`);
      projectId = data.id;
    }
    created.push({ projectId, meta });
  }
  console.log(`✅ Practice projects ready: ${created.length}`);
  return created;
}

async function clearOldRecords(userId) {
  const dr = await admin.from('daily_records').delete().eq('user_id', userId);
  if (dr.error) throw new Error(`clear daily_records: ${dr.error.message}`);
  const mr = await admin.from('meditation_records').delete().eq('user_id', userId);
  if (mr.error) throw new Error(`clear meditation_records: ${mr.error.message}`);
  const sr = await admin.from('study_records').delete().eq('user_id', userId);
  if (sr.error) throw new Error(`clear study_records: ${sr.error.message}`);
}

async function seedPracticeHistory(userId, projects) {
  const dailyRows = [];
  const meditationRows = [];

  for (const { projectId, meta } of projects) {
    const isSession = meta.practice_category === 'session';
    const target = isSession ? 1 : meta.daily_target || 100;

    for (let d = SEED_DAYS - 1; d >= 0; d--) {
      const date = todayMinus(d);
      // Realistic variance: 60–110% of daily target, occasional rest day
      const restDay = d % 7 === 6; // skip every 7th day going back
      if (restDay) continue;

      if (isSession) {
        // Time-based meditation: 30–55 minutes
        const minutes = 30 + Math.floor(Math.random() * 26);
        meditationRows.push({
          user_id: userId,
          practice_id: meta.practice_id,
          record_date: date,
          duration_minutes: minutes,
          method: '前行实修',
          reflection: d === 0 ? '今日观修清明，安住明觉。' : null,
        });
      } else {
        const factor = 0.6 + Math.random() * 0.5;
        const count = Math.max(1, Math.round(target * factor));
        dailyRows.push({
          user_id: userId,
          practice_project_id: projectId,
          record_date: date,
          count,
        });
      }
    }
  }

  if (dailyRows.length) {
    const { error } = await admin.from('daily_records').insert(dailyRows);
    if (error) throw new Error(`insert daily_records: ${error.message}`);
  }
  if (meditationRows.length) {
    const { error } = await admin.from('meditation_records').insert(meditationRows);
    if (error) throw new Error(`insert meditation_records: ${error.message}`);
  }
  console.log(
    `✅ Seeded ${dailyRows.length} daily_records and ${meditationRows.length} meditation_records over ${SEED_DAYS} days`,
  );
}

async function recomputeCurrentCounts(userId, projects) {
  for (const { projectId } of projects) {
    const { data, error } = await admin
      .from('daily_records')
      .select('count')
      .eq('user_id', userId)
      .eq('practice_project_id', projectId);
    if (error) throw new Error(`select daily_records sum: ${error.message}`);
    const sum = (data || []).reduce((acc, r) => acc + (r.count || 0), 0);
    if (sum > 0) {
      const { error: updErr } = await admin
        .from('user_practice_projects')
        .update({ current_count: sum })
        .eq('id', projectId);
      if (updErr) throw new Error(`update current_count: ${updErr.message}`);
    }
  }
  console.log('✅ Refreshed current_count totals on practice projects');
}

async function seedStudyRecords(userId, courseIds) {
  if (!courseIds.length) return;
  // Pick the first course; seed listening + reading on first 3 lessons.
  // NOTE: study_type values must match what runtime code in lib/database.ts
  // expects ('听传承' / '看法本'). The longer '听上师传承' label appears in
  // class_required_courses.required_study_types but is NOT what gets written
  // into study_records — using it would make the seeded lessons fail to count
  // toward course completion in app/course-detail/[courseId].tsx.
  const courseId = courseIds[0];
  const { data: lessons, error: lessonsErr } = await admin
    .from('course_lessons')
    .select('id, lesson_number')
    .eq('course_id', courseId)
    .order('lesson_number', { ascending: true })
    .limit(3);
  if (lessonsErr) throw new Error(`select course_lessons: ${lessonsErr.message}`);
  if (!lessons || !lessons.length) {
    console.log('ℹ️  No lessons found for first course — skipping study_records seed');
    return;
  }
  const rows = [];
  lessons.forEach((lesson, idx) => {
    rows.push({
      user_id: userId,
      course_id: courseId,
      lesson_id: lesson.id,
      study_date: todayMinus(idx * 2 + 1),
      study_type: '听传承',
      study_count_for_lesson: 1,
    });
    rows.push({
      user_id: userId,
      course_id: courseId,
      lesson_id: lesson.id,
      study_date: todayMinus(idx * 2),
      study_type: '看法本',
      study_count_for_lesson: 1,
    });
  });
  const { error } = await admin.from('study_records').insert(rows);
  if (error) throw new Error(`insert study_records: ${error.message}`);
  console.log(`✅ Seeded ${rows.length} study_records on first course (study_type: 听传承 / 看法本)`);
}

(async () => {
  console.log('───────────────────────────────────────────');
  console.log(' Reviewer demo account seeder');
  console.log('───────────────────────────────────────────');
  console.log(` Email:        ${REVIEWER_EMAIL}`);
  console.log(` Class:        ${REVIEWER_CLASS_NAME} (${REVIEWER_ENTRY_YEAR})`);
  console.log(` Dharma name:  ${REVIEWER_DHARMA_NAME}`);
  console.log(` Seed window:  last ${SEED_DAYS} days`);
  console.log('───────────────────────────────────────────');

  try {
    const authUser = await createOrUpdateAuthUser();
    await upsertProfile(authUser.id);
    const cls = await getClassByName(REVIEWER_CLASS_NAME);
    await enrollInClass(authUser.id, cls.id);
    const courseIds = await joinRequiredCourses(authUser.id, cls.id);
    const projects = await createPracticeProjects(authUser.id, cls.id);
    await clearOldRecords(authUser.id);
    await seedPracticeHistory(authUser.id, projects);
    await recomputeCurrentCounts(authUser.id, projects);
    await seedStudyRecords(authUser.id, courseIds);

    console.log('\n✅ Reviewer account ready.');
    console.log('───────────────────────────────────────────');
    console.log(` Email:    ${REVIEWER_EMAIL}`);
    console.log(` Password: ${REVIEWER_PASSWORD}`);
    console.log(' (Save the password somewhere safe. The app uses email OTP,');
    console.log('  so the reviewer cannot use this password to sign in directly —');
    console.log('  see docs/APP_STORE_SUBMISSION.md → "Sign-In Information for');
    console.log('  Reviewers" for the OTP forwarding workflow.)');
    console.log('───────────────────────────────────────────');
  } catch (err) {
    console.error('\n❌ Seeder failed:', err.message || err);
    process.exit(1);
  }
})();
