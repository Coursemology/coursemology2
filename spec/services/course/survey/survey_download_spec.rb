# frozen_string_literal: true
require 'rails_helper'
require 'csv'

RSpec.describe Course::Survey::SurveyDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course).user }
    let!(:survey) do
      create(:survey, course: course, published: true, end_at: Time.zone.now + 1.day,
                      creator: course.creator, updater: course.creator)
    end

    describe '#generate_csv' do
      subject do
        CSV.parse(Course::Survey::SurveyDownloadService.send(:generate_csv, survey))
      end

      let!(:submitted_responses) do
        [
          create(:course_survey_response, survey: survey, submitted_at: Time.zone.now),
          create(:course_survey_response, survey: survey, submitted_at: Time.zone.now),
          create(:course_survey_response, survey: survey, submitted_at: Time.zone.now)
        ]
      end

      let!(:unsubmitted_response) do
        create(:course_survey_response, survey: survey, creator: student, submitted_at: nil)
      end

      let!(:questions) do
        section = create(:course_survey_section, survey: survey)
        [
          create(:course_survey_question, question_type: :text, section: section, weight: 3),
          create(:course_survey_question, question_type: :text, section: section, weight: 2),
          create(:course_survey_question, question_type: :text, section: section, weight: 1)
        ]
      end

      before do
        submitted_responses.each do |response|
          create(:course_survey_answer, question: questions[0], response: response, text_response: 'Q1 Answer')
          create(:course_survey_answer, question: questions[1], response: response, text_response: 'Q2 Answer')
          create(:course_survey_answer, question: questions[2], response: response, text_response: 'Q3 Answer')
        end
      end

      context 'header' do
        it 'sixth element (inclusive) onwards is question descriptions in increasing weight' do
          question_descriptions = questions.sort_by(&:weight).map(&:description)
          expect(subject[0].slice(5..)).to eq(question_descriptions)
        end
      end

      context 'rows' do
        it 'ignores unsubmitted responses' do
          expect(subject.size - 1).to eq(submitted_responses.size)
        end
      end
    end

    describe '#generate_row' do
      subject do
        Course::Survey::SurveyDownloadService.send(:generate_row, response, questions)
      end

      let(:response) do
        create(:course_survey_response, survey: survey, creator: student,
                                        submitted_at: Time.zone.now)
      end

      let(:questions) do
        section = create(:course_survey_section, survey: survey)
        [
          create(:course_survey_question, question_type: :text, section: section),
          create(:course_survey_question, question_type: :text, section: section),
          create(:course_survey_question, question_type: :text, section: section)
        ]
      end

      let!(:answers) do
        [
          create(:course_survey_answer, question: questions[0], response: response, text_response: 'Q1 Answer'),
          create(:course_survey_answer, question: questions[1], response: response, text_response: 'Q2 Answer'),
          create(:course_survey_answer, question: questions[2], response: response, text_response: 'Q3 Answer')
        ]
      end

      it 'returns an array with five more elements than the no. of questions' do
        expect(subject.size).to eq(questions.size + 5)
      end

      it 'first five elements are submit timestamp, last update timestamp, course user id, name, and role' do
        expect(subject.slice(0..4)).to eq(
          [
            response.submitted_at,
            response.updated_at,
            response.course_user.id,
            response.course_user.name,
            response.course_user.role
          ]
        )
      end

      it 'returns answers that correspond to questions' do
        expect(subject.slice(5..)).to eq(['Q1 Answer', 'Q2 Answer', 'Q3 Answer'])
      end
    end

    describe '#generate_value' do
      subject do
        Course::Survey::SurveyDownloadService.send(:generate_value, answer)
      end

      let(:response) do
        create(:course_survey_response, survey: survey, creator: student,
                                        submitted_at: Time.zone.now)
      end

      let(:options) do
        [
          create(:course_survey_question_option, question: question, option: 'Cool', weight: 5),
          create(:course_survey_question_option, question: question, option: 'Nice', weight: 2),
          create(:course_survey_question_option, question: question, option: 'Ok', weight: 3)
        ]
      end

      context 'MRQ question' do
        let(:question) do
          section = create(:course_survey_section, survey: survey)
          create(:course_survey_question, question_type: :multiple_response, section: section)
        end
        let(:answer) do
          create(:course_survey_answer, question: question, response: response)
        end

        context 'all options are selected' do
          before do
            options.each do |question_option|
              answer.options.build(question_option: question_option)
            end
          end

          it 'joins all options with semicolon in increasing weight' do
            expect(subject).to eq('Nice;Ok;Cool')
          end
        end

        context 'no options are selected' do
          before do
            answer.options.destroy_all
          end

          it 'returns an empty string' do
            expect(subject).to eq('')
          end
        end
      end

      context 'MCQ question' do
        let(:question) do
          section = create(:course_survey_section, survey: survey)
          create(:course_survey_question, question_type: :multiple_choice, section: section)
        end
        let(:answer) do
          create(:course_survey_answer, question: question, response: response)
        end

        context 'one option is selected' do
          before do
            answer.options.build(question_option: options[0])
          end

          it 'returns the selected option' do
            expect(subject).to eq('Cool')
          end
        end

        context 'no options are selected' do
          before do
            answer.options.destroy_all
          end

          it 'returns an empty string' do
            expect(subject).to eq('')
          end
        end
      end

      context 'Text response question' do
        let(:question) do
          section = create(:course_survey_section, survey: survey)
          create(:course_survey_question, question_type: :text, section: section)
        end

        context 'when there is text' do
          let(:answer) do
            create(:course_survey_answer, question: question, response: response, text_response: 'Fortnite')
          end

          it 'returns the text' do
            expect(subject).to eq('Fortnite')
          end
        end

        context 'when there is no text' do
          let(:answer) do
            create(:course_survey_answer, question: question, response: response, text_response: nil)
          end

          it 'returns an empty string' do
            expect(subject).to eq('')
          end
        end
      end
    end
  end
end
