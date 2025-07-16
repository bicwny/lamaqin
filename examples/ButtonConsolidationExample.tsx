
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { componentHelpers } from '@/utils/componentTokens';
import { ButtonMigration, ConsolidatedButton } from '@/utils/buttonMigration';

// BEFORE: Old button system (5 variants)
export function OldButtonSystem() {
  return (
    <View style={{ gap: 16, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>OLD SYSTEM (5 variants)</Text>
      
      {/* Primary button */}
      <TouchableOpacity style={ButtonMigration.migrateButtonStyle('primary')}>
        <Text style={ButtonMigration.migrateButtonTextStyle('primary')}>
          Primary Button
        </Text>
      </TouchableOpacity>
      
      {/* Secondary button */}
      <TouchableOpacity style={ButtonMigration.migrateButtonStyle('secondary')}>
        <Text style={ButtonMigration.migrateButtonTextStyle('secondary')}>
          Secondary Button
        </Text>
      </TouchableOpacity>
      
      {/* Small button */}
      <TouchableOpacity style={ButtonMigration.migrateButtonStyle('small')}>
        <Text style={ButtonMigration.migrateButtonTextStyle('small')}>
          Small Button
        </Text>
      </TouchableOpacity>
      
      {/* Text button */}
      <TouchableOpacity style={ButtonMigration.migrateButtonStyle('text')}>
        <Text style={ButtonMigration.migrateButtonTextStyle('text')}>
          Text Button
        </Text>
      </TouchableOpacity>
      
      {/* Dharma button */}
      <TouchableOpacity style={ButtonMigration.migrateButtonStyle('dharma')}>
        <Text style={ButtonMigration.migrateButtonTextStyle('dharma')}>
          Dharma Button
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// AFTER: New consolidated button system (3 variants + size prop)
export function NewButtonSystem() {
  return (
    <View style={{ gap: 16, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>NEW SYSTEM (3 variants + sizes)</Text>
      
      {/* Primary buttons in different sizes */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Primary Variant:</Text>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('primary', 'small')}>
          <Text style={ConsolidatedButton.getTextStyle('primary', 'small')}>
            Primary Small
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('primary', 'medium')}>
          <Text style={ConsolidatedButton.getTextStyle('primary', 'medium')}>
            Primary Medium
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('primary', 'large')}>
          <Text style={ConsolidatedButton.getTextStyle('primary', 'large')}>
            Primary Large
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Secondary buttons in different sizes */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Secondary Variant:</Text>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('secondary', 'small')}>
          <Text style={ConsolidatedButton.getTextStyle('secondary', 'small')}>
            Secondary Small
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('secondary', 'medium')}>
          <Text style={ConsolidatedButton.getTextStyle('secondary', 'medium')}>
            Secondary Medium
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Ghost buttons in different sizes */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Ghost Variant:</Text>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('ghost', 'small')}>
          <Text style={ConsolidatedButton.getTextStyle('ghost', 'small')}>
            Ghost Small
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={ConsolidatedButton.getStyle('ghost', 'medium')}>
          <Text style={ConsolidatedButton.getTextStyle('ghost', 'medium')}>
            Ghost Medium
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Migration mapping example
export function MigrationMapping() {
  return (
    <View style={{ gap: 16, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>MIGRATION MAPPING</Text>
      
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Old → New:</Text>
        <Text>• primary → primary + medium</Text>
        <Text>• secondary → secondary + medium</Text>
        <Text>• small → secondary + small</Text>
        <Text>• text → ghost + medium</Text>
        <Text>• dharma → primary + large</Text>
      </View>
      
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Benefits:</Text>
        <Text>• Reduced from 5 to 3 variants</Text>
        <Text>• Flexible size system</Text>
        <Text>• ~300 lines of code reduction</Text>
        <Text>• Better consistency</Text>
        <Text>• Easier maintenance</Text>
      </View>
    </View>
  );
}

// Complete migration example
export default function ButtonConsolidationExample() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <OldButtonSystem />
      <NewButtonSystem />
      <MigrationMapping />
    </View>
  );
}
