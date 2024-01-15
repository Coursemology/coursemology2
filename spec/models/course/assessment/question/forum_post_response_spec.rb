# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ForumPostResponse do
  it { is_expected.to act_as(Course::Assessment::Question) }
  it { is_expected.to validate_presence_of(:max_posts) }
  it { is_expected.to validate_numericality_of(:max_posts).only_integer }
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_forum_post_response) }
      it 'returns false' do
        expect(subject.auto_gradable?).to be(false)
      end
    end

    describe '#attempt' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) do
        create(:course_assessment_question_forum_post_response, assessment: assessment)
      end
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      subject { question }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      context 'when last_attempt is given' do
        let(:last_attempt) do
          build(:course_assessment_answer_forum_post_response, question: question.question)
        end

        it 'builds a new answer with old answer_text' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.answer_text).to eq(answer.answer_text)
        end

        it 'builds a new answer with old post_packs' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.post_packs).to eq(answer.post_packs)
        end
      end
    end

    describe '#question_type_readable' do
      subject { build(:course_assessment_question_forum_post_response) }

      it 'returns forum post response' do
        expect(subject.question_type_readable).to(
          eq I18n.t('course.assessment.question.forum_post_responses.question_type')
        )
      end
    end

    describe 'validations' do
      subject { build(:course_assessment_question_forum_post_response) }

      it 'validates max_posts is greater than 0' do
        subject.max_posts = 0
        expect(subject).to_not be_valid
        expect(subject.errors.messages[:max_posts]).to eq ["has to be between 1 and #{subject.max_posts_allowed}"]

        subject.max_posts = 1
        expect(subject).to be_valid
      end

      it 'validates max_posts is less than or equal max_posts_allowed' do
        subject.max_posts = subject.max_posts_allowed + 1
        expect(subject).to_not be_valid
        expect(subject.errors.messages[:max_posts]).to eq ["has to be between 1 and #{subject.max_posts_allowed}"]

        subject.max_posts = subject.max_posts_allowed
        expect(subject).to be_valid
      end
    end
  end
end
