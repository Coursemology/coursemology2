# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to belong_to(:tab) }
  it { is_expected.to have_many(:questions).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_questions).through(:questions) }
  it { is_expected.to have_many(:text_response_questions).through(:questions) }
  it { is_expected.to have_many(:programming_questions).through(:questions) }
  it { is_expected.to have_many(:submissions).dependent(:destroy) }
  it { is_expected.to have_many(:conditions) }
  it { is_expected.to have_many(:assessment_conditions).dependent(:destroy) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [] }

    it 'implements #permitted_for!' do
      expect(subject).to respond_to(:permitted_for!)
      expect { subject.permitted_for!(double) }.to_not raise_error
    end

    it 'implements #precluded_for!' do
      expect(subject).to respond_to(:precluded_for!)
      expect { subject.precluded_for!(double) }.to_not raise_error
    end

    describe 'validations' do
      context 'when it is not a draft' do
        context 'when it has no questions' do
          subject { build(:assessment, draft: false) }

          it 'adds a :no_questions error on :draft' do
            expect(subject.valid?).to be(false)
            expect(subject.errors[:draft]).to include(I18n.t('activerecord.errors.models.' \
            'course/assessment.no_questions'))
          end
        end

        context 'when it has questions' do
          subject { build(:assessment, :with_all_question_types, draft: true) }
          it { is_expected.to be_valid }
        end
      end

      context 'when it is a draft' do
        context 'when it has no questions' do
          subject { build(:assessment, draft: true) }
          it { is_expected.to be_valid }
        end

        context 'when it has questions' do
          subject { build(:assessment, :with_all_question_types, draft: true) }
          it { is_expected.to be_valid }
        end
      end

      context 'when the assessment is set to be autograded' do
        let!(:question) do
          create(:course_assessment_question_programming, *question_traits, assessment: assessment)
        end
        subject do
          assessment.autograded = true
          assessment
        end

        context 'when the assessment has a non-autograded question' do
          let(:question_traits) { nil }

          it 'is not valid' do
            expect(subject).not_to be_valid
            expect(subject.errors['base']).
              to include(I18n.t('activerecord.errors.models.course/assessment.autograded'))
          end
        end

        context 'when the assessment only has autograded questions' do
          let(:question_traits) { [:auto_gradable] }
          it { is_expected.to be_valid }
        end
      end
    end

    describe 'callbacks' do
      describe 'after assessment was initialized' do
        subject { build(:assessment) }

        it 'sets the course of the lesson plan item' do
          assessment = create(:assessment, course: course)
          expect(assessment.course).to eq(assessment.tab.category.course)
        end
      end

      describe 'after assessment was saved' do
        subject { create(:assessment) }

        it 'sets the folder to have the same attributes as the assessment' do
          expect(subject.folder.name).to eq(subject.title)
          expect(subject.folder.parent).to eq(subject.tab.category.folder)
          expect(subject.folder.course).to eq(subject.course)
          expect(subject.folder.start_at).to eq(subject.start_at)
        end
      end

      describe 'after assessment was changed' do
        subject { create(:assessment) }

        it 'updates the folder' do
          new_title = 'Whole new assessment'
          new_start_at = 1.day.ago

          subject.title = new_title
          subject.start_at = new_start_at
          subject.save

          expect(subject.folder.name).to eq(new_title)
          expect(subject.folder.start_at).to eq(new_start_at)
        end
      end
    end

    describe '.questions' do
      describe '#attempt' do
        let(:assessment) do
          assessment = build(:assessment, course: course)
          create_list(:course_assessment_question_multiple_response, 3, assessment: assessment)
          create_list(:course_assessment_question_text_response, 3, assessment: assessment)
          assessment
        end
        let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
        let(:answers) { assessment.questions.attempt(submission) }

        context 'when some questions are being attempted' do
          before do
            assessment.questions.limit(1).attempt(submission).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'instantiates new answers' do
            expect(answers.count(&:persisted?)).to eq(1)
            expect(answers.count(&:new_record?)).to eq(assessment.questions.length - 1)
          end
        end

        context 'when all questions are being attempted' do
          before do
            assessment.questions.attempt(submission).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'reuses all existing answers' do
            expect(answers.all?(&:persisted?)).to be(true)
          end
        end

        context 'when some questions have been submitted' do
          before do
            assessment.questions.limit(1).attempt(submission).tap do |answers|
              answers.each(&:finalise!)
              answers.each(&:save!)
            end
          end

          it 'creates a new answer' do
            expect(answers.all?(&:persisted?)).to be(false)
          end
        end

        context 'when reattempt is true' do
          before do
            assessment.questions.attempt(submission, reattempt: true).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'creates new answers with reattempting state' do
            expect(submission.reload.answers.with_reattempting_state.count).
              to eq(assessment.questions.count)
          end
        end
      end

      describe '#step' do
        let(:assessment_traits) { [:published_with_all_question_types] }
        let(:submission) { create(:submission, assessment: assessment, creator: student_user) }

        context 'when no question is answered' do
          it 'returns the first question' do
            expect(assessment.questions.step(submission, 2)).
              to eq(assessment.questions.first)

            expect(assessment.questions.step(submission, -1)).
              to eq(assessment.questions.first)
          end
        end

        context 'when the first question is answered' do
          before do
            answer = assessment.questions.first.attempt(submission)
            answer.correct = true
            answer.save
          end

          context 'when index is inaccessible' do
            it 'returns the first unanswered question' do
              expect(assessment.questions.step(submission, 1)).
                to eq(assessment.questions.second)
            end
          end

          context 'when index is less than 0' do
            it 'returns the first question' do
              expect(assessment.questions.step(submission, -1)).
                to eq(assessment.questions.first)
            end
          end

          context 'when index is accessible' do
            it 'returns the question at given index' do
              expect(assessment.questions.step(submission, 0)).
                to eq(assessment.questions.first)
            end
          end
        end
      end

      describe '#next_unanswered' do
        let(:assessment_traits) { [:with_all_question_types] }
        let(:submission) { create(:submission, assessment: assessment, creator: student_user) }

        subject { assessment.questions.next_unanswered(submission) }
        context 'when there is no answers' do
          it { is_expected.to eq(assessment.questions.first) }
        end

        context 'when the first question is answered correctly' do
          before do
            answer = assessment.questions.first.attempt(submission)
            answer.correct = true
            answer.save
          end

          it { is_expected.to eq(assessment.questions.second) }
        end

        context 'when all questions have been answered correctly' do
          before do
            assessment.questions.attempt(submission).each do |answer|
              answer.correct = true
              answer.save
            end
          end

          it { is_expected.to be_nil }
        end
      end
    end

    describe '#maximum_grade' do
      context 'when it has questions' do
        let(:assessment_traits) { [:with_all_question_types] }

        it 'returns the maximum grade' do
          maximum_grade = self.assessment.questions.map(&:maximum_grade).reduce(0, :+)

          expect(assessment.maximum_grade).to eq(maximum_grade)
        end
      end

      context 'when it does not have any question' do
        it 'returns 0' do
          expect(assessment.maximum_grade).to eq(0)
        end
      end
    end

    describe '.ordered_by_date' do
      let(:other_assessment) { create(:assessment, *assessment_traits, course: course) }

      it 'orders the assessments by date' do
        assessment
        other_assessment
        consecutive = course.assessments.each_cons(2)
        expect(consecutive.to_a).not_to be_empty
        expect(consecutive.all? { |first, second| first.start_at <= second.start_at })
      end
    end

    describe '.with_submissions_by' do
      let(:submission1) { create(:submission, assessment: assessment, creator: student_user) }
      let(:student_user2) { create(:course_student, course: course).user }
      let(:assessment2) { create(:assessment, *assessment_traits, course: course) }
      let(:submission2) { create(:submission, assessment: assessment, creator: student_user2) }
      let(:submission3) { create(:submission, assessment: assessment2, creator: student_user2) }

      it 'returns all assessments' do
        assessment
        expect(course.assessments.with_submissions_by(student_user)).to contain_exactly(assessment)
      end

      it "preloads the specified user's submissions" do
        submission1
        submission2

        assessments = course.assessments.with_submissions_by(student_user)
        expect(assessments.all? { |assessment| assessment.submissions.loaded? }).to be(true)
        submissions = assessments.flat_map(&:submissions)
        expect(submissions.all? { |submission| submission.creator == student_user }).to be(true)
      end

      it 'returns submissions in reverse chronological order' do
        submission2
        submission3

        assessments = course.assessments.with_submissions_by(student_user2)
        submissions = assessments.map(&:submissions).flatten
        expect(submissions).to contain_exactly(submission2, submission3)
        expect(submissions.each_cons(2).all? { |a, b| a.created_at >= b.created_at }).to be(true)
      end
    end

    context 'when there is a name conflict with other assessment in the same category' do
      let(:common_title) { 'Mission Impossible' }
      let!(:tab) { create(:assessment, title: common_title).tab }

      context 'after assessment was saved' do
        subject { build(:assessment, title: common_title, tab: tab) }
        it 'create a folder with proper name' do
          subject.save

          expect(subject.folder.name).to eq(common_title + ' (0)')
        end
      end

      context 'after assessment was changed' do
        subject { create(:assessment, title: common_title, tab: tab) }

        it 'updates the folder with proper name' do
          subject.title = common_title
          subject.save

          expect(subject.folder.name).to eq(common_title + ' (0)')
        end
      end
    end
  end
end
