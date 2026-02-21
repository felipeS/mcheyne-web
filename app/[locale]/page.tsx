import { PlanProvider } from "@/context/PlanProvider";
import { ReadingSelection } from "@/components/reading-selection";
import { DateNavigation } from "@/components/date-navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { Onboarding } from "@/components/onboarding";

export default function Page() {
  return (
    <PlanProvider>
      <Onboarding />
      <ReadingSelection />
      <DateNavigation />
      <SettingsDialog />
    </PlanProvider>
  );
}
