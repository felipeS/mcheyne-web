'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquareMore } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const PRODUCT_FEEDBACK_SURVEY_ID = '019cb856-10c4-0000-71c8-b1709668c410';

type SurveyQuestion = {
  id?: string;
  type: 'open' | 'single_choice' | string;
  question: string;
  description?: string | null;
  choices?: string[];
  buttonText?: string;
};

type FeedbackSurveyConfig = {
  id: string;
  name: string;
  description?: string;
  questions: SurveyQuestion[];
  appearance?: {
    widgetLabel?: string;
    placeholder?: string;
    thankYouMessageHeader?: string;
    thankYouMessageDescription?: string;
    displayThankYouMessage?: boolean;
  } | null;
};

function isFeedbackSurvey(survey: { id?: string }): survey is FeedbackSurveyConfig {
  return survey.id === PRODUCT_FEEDBACK_SURVEY_ID;
}

function getLocalizedChoiceLabel(
  choice: string,
  t: ReturnType<typeof useTranslations<'feedbackSurvey'>>
) {
  switch (choice) {
    case 'Suggest a new feature':
      return t('choices.suggestFeature');
    case 'Report something broken':
      return t('choices.reportBroken');
    case 'Something is missing':
      return t('choices.missing');
    default:
      return choice;
  }
}

export function FeedbackSurvey() {
  const posthog = usePostHog();
  const t = useTranslations('settings');
  const surveyT = useTranslations('feedbackSurvey');
  const [survey, setSurvey] = useState<FeedbackSurveyConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasTrackedShownRef = useRef(false);

  const loadSurvey = useCallback(
    (forceReload = false) => {
      if (!posthog) {
        return;
      }

      posthog.getActiveMatchingSurveys((surveys) => {
        const matchingSurvey = surveys.find(isFeedbackSurvey) ?? null;
        setSurvey(matchingSurvey);
      }, forceReload);
    },
    [posthog]
  );

  useEffect(() => {
    loadSurvey();
  }, [loadSurvey]);

  const categoryQuestion = useMemo(
    () => survey?.questions.find((question) => question.type === 'single_choice'),
    [survey]
  );

  const detailsQuestion = useMemo(
    () => survey?.questions.find((question) => question.type === 'open'),
    [survey]
  );

  useEffect(() => {
    if (!isOpen) {
      hasTrackedShownRef.current = false;
      return;
    }

    if (!posthog || !survey || isSubmitted || hasTrackedShownRef.current) {
      return;
    }

    posthog.capture('survey shown', {
      $survey_id: survey.id,
    });
    hasTrackedShownRef.current = true;
  }, [isOpen, isSubmitted, posthog, survey]);

  const resetState = useCallback(() => {
    setSelectedChoice('');
    setDetails('');
    setIsSubmitted(false);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setIsOpen(nextOpen);

      if (!nextOpen) {
        if (isSubmitted) {
          setSurvey(null);
        }

        // This dialog is intentionally on-demand, so closing it should not permanently
        // dismiss the survey for the user before they decide to submit.
        resetState();
      }
    },
    [isSubmitted, resetState]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (
        !posthog ||
        !survey ||
        !categoryQuestion?.id ||
        !detailsQuestion?.id ||
        !selectedChoice ||
        !details.trim()
      ) {
        return;
      }

      posthog.capture('survey sent', {
        $survey_id: survey.id,
        [`$survey_response_${categoryQuestion.id}`]: selectedChoice,
        [`$survey_response_${detailsQuestion.id}`]: details.trim(),
      });

      setIsSubmitted(true);
    },
    [categoryQuestion?.id, details, detailsQuestion?.id, posthog, selectedChoice, survey]
  );

  const triggerLabel = surveyT('trigger');
  const canRenderSurveyForm = !!survey && !!categoryQuestion?.choices?.length && !!detailsQuestion;

  if (!canRenderSurveyForm) {
    return null;
  }

  const canSubmit = selectedChoice.length > 0 && details.trim().length > 0;
  const activeSurvey = survey;
  const categoryChoices = categoryQuestion.choices ?? [];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
        aria-label={triggerLabel}
      >
        <MessageSquareMore className="h-4 w-4" />
        <span className="hidden sm:inline">{triggerLabel}</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {isSubmitted && activeSurvey ? (
            <>
              <DialogHeader>
                <DialogTitle>{surveyT('thankYouTitle')}</DialogTitle>
                <DialogDescription>
                  {activeSurvey.appearance?.thankYouMessageDescription ||
                    surveyT('thankYouDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => handleOpenChange(false)}>{t('close')}</Button>
              </DialogFooter>
            </>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{surveyT('title')}</DialogTitle>
                <DialogDescription>{surveyT('description')}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-sm font-medium">{surveyT('categoryQuestion')}</p>
                <div className="grid gap-2">
                  {categoryChoices.map((choice) => {
                    const isSelected = selectedChoice === choice;

                    return (
                      <button
                        key={choice}
                        type="button"
                        className={cn(
                          'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border hover:bg-accent hover:text-accent-foreground'
                        )}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedChoice(choice)}
                      >
                        {getLocalizedChoiceLabel(choice, surveyT)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium" htmlFor="feedback-details">
                  {surveyT('detailsQuestion')}
                </label>
                <p className="text-sm text-muted-foreground">{surveyT('detailsDescription')}</p>
                <Textarea
                  id="feedback-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder={surveyT('placeholder')}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {surveyT('submit')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
