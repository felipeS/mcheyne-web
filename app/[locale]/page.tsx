import { PlanProvider } from '@/context/PlanProvider';
import { ReadingSelection } from '@/components/reading-selection';
import { DateNavigation } from '@/components/date-navigation';
import { SettingsDialog } from '@/components/settings-dialog';
import { Onboarding } from '@/components/onboarding';
import { ProgressTracker } from '@/components/progress-tracker';
import { WebMcpTools } from '@/components/webmcp-tools';

export default function Page() {
  return (
    <PlanProvider>
      <Onboarding />
      <ProgressTracker />
      <ReadingSelection />
      <DateNavigation />
      <SettingsDialog />
      <WebMcpTools />
    </PlanProvider>
  );
}
