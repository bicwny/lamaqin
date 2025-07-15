import Header, { HeaderContext } from './Header';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
  context?: HeaderContext;
}

export default function PageHeader({ 
  title, 
  subtitle,
  showBackButton = false, 
  onBackPress, 
  rightAction,
  context = 'page'
}: PageHeaderProps) {
  return (
    <Header
      title={title}
      subtitle={subtitle}
      context={context}
      showBackButton={showBackButton}
      onBackPress={onBackPress}
      rightAction={rightAction}
    />
  );
}