import { PlanProvider } from "@/context/PlanProvider";
import { Header } from "@/components/header";
import { ReadingSelection } from "@/components/reading-selection";
import { DateNavigation } from "@/components/date-navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { Onboarding } from "@/components/onboarding";

export default function Page() {
  return (
    <PlanProvider>
      <main className="mx-auto max-w-screen-sm p-4 flex flex-col items-center gap-6">
        <Header />
        <Onboarding />
        <ReadingSelection />
        <DateNavigation />
        <SettingsDialog />
      </main>
    </PlanProvider>
  );
}
