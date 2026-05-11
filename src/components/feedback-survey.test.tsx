import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackSurvey } from './feedback-survey';

const mockPostHog = {
  getActiveMatchingSurveys: jest.fn(),
  getSurveys: jest.fn(),
  capture: jest.fn(),
};

const survey = {
  id: '019cb856-10c4-0000-71c8-b1709668c410',
  name: 'Product feedback',
  description: 'Share ideas, bugs, or missing functionality.',
  appearance: {
    widgetLabel: 'Feedback',
    placeholder: 'Start typing...',
    thankYouMessageHeader: 'Thank you for your feedback!',
  },
  questions: [
    {
      id: '5843b1d1-6105-4e15-bae3-bb260c925e44',
      type: 'single_choice',
      question: 'What would you like to share?',
      choices: ['Suggest a new feature', 'Report something broken', 'Something is missing'],
    },
    {
      id: '6d80331b-a099-496e-8248-f1f1589f334b',
      type: 'open',
      question: 'Tell us more',
      description: 'Please describe your suggestion or issue in as much detail as you would like.',
      buttonText: 'Submit',
    },
  ],
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      settings: {
        cancel: 'Cancel',
        close: 'Close',
      },
      feedbackSurvey: {
        trigger: 'Feedback',
        title: 'Product feedback',
        description: 'Share ideas, bugs, or missing functionality.',
        categoryQuestion: 'What would you like to share?',
        detailsQuestion: 'Tell us more',
        detailsDescription:
          'Please describe your suggestion or issue in as much detail as you would like.',
        placeholder: 'Start typing...',
        submit: 'Submit',
        thankYouTitle: 'Thank you for your feedback!',
        thankYouDescription: 'Your response has been recorded.',
        'choices.suggestFeature': 'Suggest a new feature',
        'choices.reportBroken': 'Report something broken',
        'choices.missing': 'Something is missing',
      },
    };

    return (key: string) => translations[namespace]?.[key] ?? key;
  },
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => mockPostHog,
}));

describe('FeedbackSurvey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when the survey is not active for the user', async () => {
    mockPostHog.getActiveMatchingSurveys.mockImplementation((callback: (surveys: []) => void) => {
      callback([]);
    });

    render(<FeedbackSurvey />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Feedback' })).not.toBeInTheDocument();
    });
  });

  it('captures survey events and responses from the custom UI', async () => {
    mockPostHog.getActiveMatchingSurveys.mockImplementation(
      (callback: (surveys: (typeof survey)[]) => void) => {
        callback([survey]);
      }
    );

    render(<FeedbackSurvey />);

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Feedback' }));

    expect(mockPostHog.capture).toHaveBeenCalledWith('survey shown', {
      $survey_id: survey.id,
    });

    await user.click(screen.getByRole('button', { name: 'Report something broken' }));
    await user.type(screen.getByLabelText('Tell us more'), 'The language switch needs a refresh.');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(mockPostHog.capture).toHaveBeenCalledWith('survey sent', {
      $survey_id: survey.id,
      ['$survey_response_5843b1d1-6105-4e15-bae3-bb260c925e44']: 'Report something broken',
      ['$survey_response_6d80331b-a099-496e-8248-f1f1589f334b']:
        'The language switch needs a refresh.',
    });

    expect(await screen.findByText('Thank you for your feedback!')).toBeInTheDocument();
  });
});
