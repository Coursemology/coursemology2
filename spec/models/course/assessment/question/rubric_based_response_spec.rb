# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::RubricBasedResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Question) }

  # Deprecated v1 rows: kept only so destroying a question cleans them up.
  it 'has many categories' do
    expect(subject).to have_many(:categories).
      class_name(Course::Assessment::Question::RubricBasedResponseCategory.name).
      dependent(:destroy)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_rubric_based_response) }

      it 'is true with an active rubric and AI grading enabled' do
        expect(subject.auto_gradable?).to be(true)
      end

      it 'is false with AI grading disabled' do
        subject.ai_grading_enabled = false
        expect(subject.auto_gradable?).to be(false)
      end
    end

    describe '#validate_active_rubric' do
      subject { build(:course_assessment_question_rubric_based_response) }

      it 'is valid with a valid active rubric' do
        expect(subject).to be_valid
      end

      it 'is invalid without an active rubric' do
        subject.active_rubric = nil
        expect(subject).not_to be_valid
        expect(subject.errors[:active_rubric]).to be_present
      end

      it "surfaces the active rubric's validation messages" do
        rubric = subject.active_rubric
        rubric.categories.build(name: rubric.categories.first.name,
                                criterions: [Course::Rubric::Category::Criterion.new(grade: 0, explanation: 'x')])

        expect(subject).not_to be_valid
        expect(subject.errors[:categories]).to include(/duplicate_category_names/)
      end
    end

    describe '#ensure_active_rubric_from_v1!' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) { create(:course_assessment_question_rubric_based_response, assessment: assessment) }

      it 'is a no-op when the question already has an active rubric' do
        question # created (with its rubric) before the count is taken
        expect { question.ensure_active_rubric_from_v1!(course) }.not_to change(Course::Rubric, :count)
      end

      context 'when a legacy question has only v1 rubric rows' do
        before do
          question.acting_as.update_column(:active_rubric_id, nil)
          category = Course::Assessment::Question::RubricBasedResponseCategory.create!(question: question,
                                                                                       name: 'Legacy')
          Course::Assessment::Question::RubricBasedResponseCriterion.create!(category: category, grade: 0,
                                                                             explanation: 'None')
        end

        it 'builds and activates a v2 rubric from them, without writing v1 rows' do
          reloaded = described_class.find(question.id)

          expect { reloaded.ensure_active_rubric_from_v1!(course) }.
            not_to change(Course::Assessment::Question::RubricBasedResponseCategory, :count)
          expect(reloaded.active_rubric.categories.map(&:name)).to eq(['Legacy'])
          expect(described_class.find(question.id).active_rubric_id).to eq(reloaded.active_rubric.id)
        end
      end
    end

    describe 'duplication' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) { create(:course_assessment_question_rubric_based_response, assessment: assessment) }

      subject(:duplicate) do
        Duplicator.new([], destination_course: course, current_course: course).duplicate(question).tap(&:save!)
      end

      it 'gives the duplicate its own rubric of identical content rather than sharing the source rubric' do
        expect(duplicate.active_rubric).to be_present
        expect(duplicate.active_rubric).not_to eq(question.active_rubric)
        expect(duplicate.active_rubric.canonical_content_hash).to eq(question.active_rubric.content_hash)
      end

      it "links the duplicate's rubric to it, so the playground can reach it" do
        expect(duplicate.acting_as.reload.rubrics).to contain_exactly(duplicate.active_rubric)
      end

      it 'does not copy deprecated v1 rubric rows' do
        Course::Assessment::Question::RubricBasedResponseCategory.create!(question: question, name: 'Legacy')

        expect(duplicate.categories).to be_empty
      end
    end
  end
end
