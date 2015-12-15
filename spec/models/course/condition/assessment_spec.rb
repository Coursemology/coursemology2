require 'rails_helper'

RSpec.describe Course::Condition::Assessment, type: :model do
  it { is_expected.to act_as(:condition).class_name(Course::Condition.name) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#title' do
      let(:assessment) { create(:course_assessment_assessment, title: 'Dummy', course: course) }
      subject { create(:course_condition_assessment, assessment: assessment) }

      context 'when there is no minimum grade percentage' do
        it 'returns the assessment title' do
          expect(subject.title).to eq(assessment.title)
        end
      end

      context 'when there is minimum grade percentage' do
        it 'returns the assessment title with the minimum grade percentage' do
          subject.minimum_grade_percentage = 33.333

          expect(subject.title).
            to eq(Course::Condition::Assessment.
                    human_attribute_name('title.title',
                                         assessment_title: assessment.title,
                                         minimum_grade_percentage: '33.33%'))
        end
      end
    end

    describe '#satisfied_by?' do
      let(:course_user) { create(:course_user) }
      let(:assessment) do
        assessment = create(:assessment)
        create(:course_assessment_question_multiple_response,
               maximum_grade: 10, assessment: assessment)
        assessment
      end

      context 'when there is no minimum grade percentage' do
        subject { create(:course_condition_assessment, assessment: assessment) }

        context 'when there is no submission' do
          it 'returns false' do
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when the submission is not graded' do
          it 'returns false' do
            create(:submission, workflow_state: :attempting, assessment: assessment,
                                user: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when the submission is graded' do
          it 'returns true' do
            create(:submission, workflow_state: :graded, assessment: assessment,
                                user: course_user.user)
            expect(subject.satisfied_by?(course_user)).to be_truthy
          end
        end
      end

      context 'when there is minimum grade percentage' do
        subject do
          condition = create(:course_condition_assessment, minimum_grade_percentage: 60)
          condition.assessment = assessment
          condition
        end
        # This submission is graded but its grade is below the minimum grade percentage to satisfy
        # the condition.
        let(:below_minimum_grade_submission) do
          submission = create(:submission, workflow_state: :graded, assessment: assessment,
                                           user: course_user.user)
          answers = assessment.questions.attempt(submission)
          answers.each do |answer|
            answer.finalise!
            answer.grade = 0
            answer.save!
          end
          submission
        end
        let(:submission) do
          create(:submission, workflow_state: :graded, assessment: assessment,
                              user: course_user.user)
        end

        before do
          submission
          below_minimum_grade_submission
        end

        context 'when all graded submissions are below the minimum grade percentage' do
          it 'returns false' do
            answers = assessment.questions.attempt(submission)
            answers.each do |answer|
              answer.finalise!
              answer.grade = 5
              answer.save!
            end

            expect(subject.satisfied_by?(course_user)).to be_falsey
          end
        end

        context 'when at least one submission is at least the minimum grade percentage' do
          it 'returns true' do
            answers = assessment.questions.attempt(submission)
            answers.each do |answer|
              answer.finalise!
              answer.grade = 6
              answer.save!
            end

            expect(subject.satisfied_by?(course_user)).to be_truthy
          end
        end
      end
    end
  end
end
