# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission do
  it { is_expected.to belong_to(:assessment).without_validating_presence }
  it { is_expected.to have_many(:answers).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_answers).through(:answers) }
  it { is_expected.to have_many(:text_response_answers).through(:answers) }
  it { is_expected.to have_many(:programming_answers).through(:answers) }
  it { is_expected.to have_many(:forum_post_response_answers).through(:answers) }
  it { is_expected.to accept_nested_attributes_for(:answers) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [:with_mcq_question] }
    let(:user) { course.course_users.first.user }

    let(:course_student1) { create(:course_student, *course_student1_traits, course: course) }
    let(:user1) { course_student1.user }
    let(:submission1) do
      create(:submission, *submission1_traits,
             assessment: assessment, creator: user1, course_user: course_student1)
    end
    let(:course_student1_traits) { [] }
    let(:submission1_traits) { [] }
    let(:course_student2) { create(:course_student, course: course) }
    let(:user2) { course_student2.user }
    let(:submission2) do
      create(:submission, *submission2_traits,
             assessment: assessment, creator: user2, course_user: course_student2)
    end
    let(:submission2_traits) { [] }
    let(:course_student3) { create(:course_student, course: course) }
    let(:user3) { course_student3.user }
    let(:submission3) do
      create(:submission, *submission3_traits,
             assessment: assessment, creator: user3, course_user: course_student3)
    end
    let(:submission3_traits) { [] }

    describe 'validations' do
      context 'when the course user is different from the submission creator' do
        let(:course_student) { create(:course_student, course: course) }
        subject do
          build(:submission, assessment: assessment, course_user: course_student, creator: user1)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:experience_points_record]).
            to include(I18n.
              t('activerecord.errors.models.course/assessment/submission.'\
                'attributes.experience_points_record.inconsistent_user'))
        end
      end

      context 'when a submission for the user and assessment already exists' do
        before do
          submission2
        end

        subject do
          build(:course_assessment_submission, assessment: assessment, creator: user2)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:base]).
            to include(I18n.
              t('activerecord.errors.models.course/assessment/submission.'\
                'submission_already_exists'))
        end
      end

      context 'when submission is published' do
        let(:submission1_traits) { :published }
        subject { submission1 }
        before { subject }

        context 'when awarded_at is nil' do
          it 'is not valid' do
            subject.awarded_at = nil
            expect(subject).not_to be_valid
            expect(subject.errors.messages[:experience_points_record]).
              to include(I18n.
                t('activerecord.errors.models.course/assessment/submission.'\
                  'attributes.experience_points_record.absent_award_attributes'))
          end
        end

        context 'when awarder is nil' do
          it 'is not valid' do
            subject.awarder = nil
            expect(subject).not_to be_valid
            expect(subject.errors.messages[:experience_points_record]).
              to include(I18n.
                t('activerecord.errors.models.course/assessment/submission.'\
                  'attributes.experience_points_record.absent_award_attributes'))
          end
        end
      end

      context 'when submission is submitted' do
        let(:submission1_traits) { :submitted }
        subject { submission1 }

        context 'when submitted_at is nil' do
          it 'is not valid' do
            subject.submitted_at = nil
            expect(subject).not_to be_valid
          end
        end
      end
    end

    describe '.answers' do
      describe '.latest_answers' do
        context 'when the submission has multiple answers for the same question' do
          let(:assessment_traits) { [:with_mrq_question] }
          let(:submission1_traits) { :submitted }
          subject { submission1.answers.latest_answers }

          it 'only returns the latest answer' do
            submission1
            new_answer = create(:course_assessment_answer_multiple_response, :submitted,
                                assessment: assessment, question: assessment.questions.first,
                                submission: submission1, creator: user1).acting_as
            expect(subject).to contain_exactly(new_answer)
          end
        end
      end
    end

    describe '.by_user' do
      before do
        submission1
        submission2
      end

      it "only returns the selected user's submissions" do
        expect(assessment.submissions.by_user(user1).empty?).to be(false)
        expect(assessment.submissions.by_user(user1).
          all? { |submission| submission.course_user.user == user1 }).to be(true)
      end
    end

    describe '.by_users' do
      before do
        submission1
        submission2
      end

      it 'only returns the selected submissions by the provided user ids' do
        expect(assessment.submissions.by_users(user1.id)).to contain_exactly(submission1)
        expect(assessment.submissions.by_users([user1.id, user2.id])).
          to contain_exactly(submission1, submission2)
      end
    end

    describe '.from_category' do
      let(:new_category) { create(:course_assessment_category, course: course) }
      let(:new_tab) { create(:course_assessment_tab, course: course, category: new_category) }
      let(:new_assessment) { create(:assessment, course: course, tab: new_tab) }
      let!(:new_submission) { create(:submission, assessment: new_assessment, creator: user1) }
      let(:submissions) { [submission1, new_submission] }
      subject { Course::Assessment::Submission.from_category(new_category) }

      it 'returns submissions from assessments in this category' do
        expect(subject).to contain_exactly(new_submission)
      end
    end

    describe '.from_course' do
      let(:new_course) { create(:course) }
      let(:new_student) { create(:course_student, course: new_course) }
      let(:new_assessment) { create(:assessment, course: new_course) }
      let!(:new_submission) do
        create(:submission, assessment: new_assessment, creator: new_student.user)
      end

      it 'returns submissions from assessments in the specified course' do
        submission1
        expect(Course::Assessment::Submission.from_course(course)).to contain_exactly(submission1)
        expect(Course::Assessment::Submission.from_course(new_course)).
          to contain_exactly(new_submission)
      end
    end

    describe '.ordered_by_date' do
      before do
        submission1
        submission2
      end

      it 'returns the submissions in the specified order' do
        expect(assessment.submissions.ordered_by_date.length).to be >= 2
        expect(assessment.submissions.ordered_by_date.each_cons(2).
          all? { |a, b| a.created_at >= b.created_at }).to be(true)
      end
    end

    describe '.ordered_by_submitted_date' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :submitted }
      let(:submission2_traits) { :submitted }
      before do
        submission1
        submission2
      end

      it 'returns the submissions in the descending order' do
        expect(assessment.submissions.ordered_by_submitted_date.length).to be >= 2
        expect(assessment.submissions.ordered_by_submitted_date.each_cons(2).
          all? { |a, b| a.submitted_at >= b.submitted_at }).to be(true)
      end
    end

    describe '.confirmed' do
      let(:submission1_traits) { :attempting }
      let(:submission2_traits) { :submitted }
      let(:submission3_traits) { :published }
      let!(:submissions) { [submission1, submission2, submission3] }

      it 'returns the submissions with submitted or published workflow state' do
        states = assessment.submissions.confirmed.map(&:workflow_state)
        expect(states).to contain_exactly('published', 'submitted')
      end
    end

    describe '.filter_by_params' do
      let(:group) do
        group = create(:course_group, course: course)
        create(:course_group_user, group: group, course: course, course_user: course_student1)
        group
      end
      let(:params) do
        { assessment_id: assessment.id, group_id: group.id, user_id: user1.id }
      end

      before do
        submission1
        submission2
        submission3
      end

      it 'filters submissions' do
        group
        expect(assessment.submissions.filter_by_params(params)).to contain_exactly(submission1)
      end

      context 'when group id is given' do
        let(:params) { { group_id: group.id } }

        it 'filters submissions by the group' do
          group
          expect(assessment.submissions.filter_by_params(params)).to contain_exactly(submission1)
        end
      end

      context 'when user id is given' do
        let(:params) { { user_id: user2.id } }

        it 'filters submissions by the user' do
          expect(assessment.submissions.filter_by_params(params)).to contain_exactly(submission2)
        end
      end

      context 'when assessment id is given' do
        let(:params) { { assessment_id: assessment.id } }

        it 'filters submissions by assessment' do
          expect(assessment.submissions.filter_by_params(params)).
            to contain_exactly(submission1, submission2, submission3)
        end
      end

      context 'when category id is given' do
        let(:new_category) { create(:course_assessment_category, course: course) }
        let(:new_tab) { create(:course_assessment_tab, course: course, category: new_category) }
        let(:new_assessment) { create(:assessment, course: course, tab: new_tab) }
        let(:new_submission) { create(:submission, assessment: new_assessment, creator: user2) }
        let(:params) { { category_id: new_category.id } }

        it 'filters submissions by category' do
          new_submission
          expect(Course::Assessment::Submission.filter_by_params(params)).to contain_exactly(new_submission)
        end
      end
    end

    describe '#grade' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :submitted }
      let(:submission) { submission1 }
      let!(:earlier_answer) do
        answer = create(:course_assessment_answer_multiple_response, :graded,
                        assessment: assessment,
                        question: assessment.multiple_response_questions.first.acting_as,
                        submission: submission1).acting_as
        answer.grade = 1
        answer.created_at = 1.day.ago
        answer.save!
        submission1.reload
        answer
      end

      it 'sums the grade of all answers' do
        grade = submission.answers.map(&:grade).compact.sum - earlier_answer.grade
        expect(submission.grade.to_f).to eq(grade)
      end
    end

    describe '#graded_at' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :published }
      let(:submission) { submission1 }

      it 'takes the maximum graded_at' do
        expect(submission.graded_at).to be_within(0.1).
          of(submission.answers.max_by(&:graded_at).graded_at)
      end
    end

    describe '#finalise!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :attempting }
      let(:submission) { submission1 }

      it 'propagates the finalise state to latest answers and sets the submitted_at time' do
        expect(submission.current_answers.all?(&:attempting?)).to be(true)
        expect(submission.submitted_at).to be_nil
        submission.finalise!
        expect(submission.current_answers.all?(&:submitted?)).to be(true)
        expect(submission.submitted_at).not_to be_nil
      end

      with_active_job_queue_adapter(:test) do
        it 'creates a new auto grading job' do
          submission.finalise!
          expect { submission.save }.to \
            have_enqueued_job(Course::Assessment::Submission::AutoGradingJob).exactly(:once)
        end
      end

      context 'when one of the answers is finalised' do
        before do
          answer = submission.answers.sample
          answer.finalise!
          answer.save!
        end

        it 'finalises the rest of the answers' do
          expect(submission.current_answers.all?(&:submitted?)).to be(false)
          submission.finalise!
          expect(submission.current_answers.all?(&:submitted?)).to be(true)
        end
      end

      context 'when there is an attempting answer that is not the latest answer' do
        let(:answer) { submission.answers.first }
        before do
          create(:course_assessment_answer, submission: answer.submission,
                                            question: answer.question)
        end

        it 'only finalises the current working answer' do
          not_current_answer = submission.answers.reload.from_question(answer.question.id).second
          expect(not_current_answer).to be_attempting
          submission.finalise!
          expect(not_current_answer).to be_attempting
        end
      end

      context 'when there are no questions' do
        let(:assessment_traits) { [:published] }

        it 'publishes the submission with 0 points' do
          submission.finalise!
          submission.save!

          expect(submission.workflow_state).to eq 'published'
          expect(submission.points_awarded).to eq 0
        end
      end
    end

    describe '#mark!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission) { submission1 }
      let(:submission1_traits) { :submitted }

      it 'propagates the graded state to its answers' do
        expect(submission.answers.all?(&:submitted?)).to be(true)
        submission.mark!
        expect(submission.answers.all?(&:graded?)).to be(true)
      end
    end

    describe '#publish!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let!(:submission) { submission1 }
      let(:submission1_traits) { :submitted }
      let(:category_id) { assessment.tab.category.id }

      def set_assessment_email_setting(course, category_id, setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: :assessments,
                              course_assessment_category_id: category_id,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      it 'propagates the graded state to its answers' do
        expect(submission.answers.all?(&:submitted?)).to be(true)
        submission.publish!
        expect(submission.answers.all?(&:graded?)).to be(true)
      end

      it 'sets the publisher, awarder, awarded_at and published_at time' do
        expect(submission.publisher).to be_nil
        expect(submission.published_at).to be_nil
        expect(submission.awarder).to be_nil
        expect(submission.awarded_at).to be_nil
        submission.publish!
        expect(submission.publisher).not_to be_nil
        expect(submission.published_at).not_to be_nil
        expect(submission.awarder).not_to be_nil
        expect(submission.awarded_at).not_to be_nil
      end

      it 'sends an email notification', type: :mailer do
        expect { submission.publish! }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      context 'when a user unsubscribes', type: :mailer do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: category_id,
                                setting: :grades_released).first
          course_student1.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect { submission.publish! }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "submission graded" email setting is disabled for regular students', type: :mailer do
        before { set_assessment_email_setting(course, category_id, :grades_released, false, true) }

        it 'does not send email notifications to the regular students' do
          expect { submission.publish! }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "submission graded" email setting is disabled for phantom students', type: :mailer do
        before { set_assessment_email_setting(course, category_id, :grades_released, true, false) }

        it 'does not send email notifications to phantom students' do
          course_student1.update(phantom: true)
          expect { submission.publish! }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "submission graded" setting is disabled for everyone', type: :mailer do
        before { set_assessment_email_setting(course, category_id, :grades_released, false, false) }

        it 'does not send email notifications to the users' do
          expect { submission.publish! }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when some of the answers are already graded' do
        before do
          submission.answers.sample.tap do |answer|
            answer.publish!
            answer.save!
          end

          expect(submission.answers.any?(&:graded?)).to be(true)
        end

        it 'propagates the graded state to its answers' do
          submission.publish!
          expect(submission.answers.all?(&:graded?)).to be(true)
        end
      end

      context 'when assessment enables delayed_grade_publication and when submission is graded' do
        let(:assessment_traits) { [:with_all_question_types, :delay_grade_publication] }
        let(:submission1_traits) { :graded }

        context 'when draft_points are set' do
          let(:draft_points) { 50 }
          let(:points_awarded) { nil }
          before do
            submission1.draft_points_awarded = draft_points
            submission1.save!
            submission1.points_awarded = points_awarded
            submission1.publish!
            submission1.save!
          end

          subject { submission1 }

          it 'sets draft_points_awarded to nil and points_awarded to draft_points_awarded' do
            expect(subject.draft_points_awarded).to be_nil
            expect(subject.points_awarded).to eq(draft_points)
          end

          context 'when points_awarded is provided' do
            let(:points_awarded) { 100 }

            it 'updates submission with the given points_awarded' do
              expect(subject.points_awarded).to eq(points_awarded)
            end
          end
        end
      end

      context 'when there are delayed annotations and comments' do
        let!(:assessment_traits) { [:with_programming_question] }
        let!(:submission1_traits) { :submitted }
        let!(:submission) { submission1 }
        let!(:answer) { submission.answers.first }
        let!(:file) { answer.actable.files.first }
        let!(:annotation) do
          create(:course_assessment_answer_programming_file_annotation, file: file, line: 1)
        end
        let!(:annotation_post) do
          create(:course_discussion_post, :delayed, topic: annotation.discussion_topic, creator: user)
        end
        let!(:submission_question) do
          create(:course_assessment_submission_question,
                 submission: submission, question: assessment.questions.first, course: course)
        end
        let!(:submission_question_post) do
          create(:course_discussion_post, :delayed, topic: submission_question.discussion_topic, creator: user)
        end
        it 'is set as published after publication' do
          submission.publish!
          expect(annotation_post.reload.published?).to be(true)
          expect(submission_question_post.reload.published?).to be(true)
        end
      end
    end

    describe '#auto_grade!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let(:submission1_traits) { :submitted }
      let(:submission) { submission1 }

      it 'returns an ActiveJob' do
        expect(submission.auto_grade!).to be_a(ActiveJob::Base)
      end

      with_active_job_queue_adapter(:test) do
        it 'queues the job' do
          submission
          expect { submission.auto_grade! }.to \
            have_enqueued_job(Course::Assessment::Submission::AutoGradingJob).exactly(:once)
        end
      end
    end

    describe '#unsubmit!' do
      let(:assessment_traits) { [:with_all_question_types] }
      let!(:earlier_answer) do
        answer = create(:course_assessment_answer_multiple_response, :graded,
                        assessment: assessment,
                        question: assessment.multiple_response_questions.first.acting_as,
                        submission: submission1, creator: user1).acting_as
        answer.update_column(:created_at, 1.day.ago)
        submission1.reload
        # Submission creates a grading job which could make answers go to the graded state, need to
        # wait for them to finish.
        wait_for_job
        answer
      end
      def unsubmit_and_save_subject
        subject.unsubmit!
        subject.save!
        subject.reload
      end

      subject { submission1 }

      context 'when the submission is in submitted state' do
        let(:submission1_traits) { :submitted }

        it 'resets the experience points awarded and submitted_at time' do
          expect(subject.submitted_at).not_to be_nil
          unsubmit_and_save_subject
          expect(subject.points_awarded).to be_nil
          expect(subject.submitted_at).to be_nil
        end

        it 'duplicates all submitted current answers in the submission to attempting' do
          # In this state, there are 6 current answers and 1 non-current answer
          expect(subject.answers.length).to eq(7)

          unsubmit_and_save_subject

          # In this state, there are 6 current answers and 7 non-current answer
          expect(subject.answers.length).to eq(13)
          expect(subject.current_answers.all?(&:attempting?)).to be(true)
          expect(earlier_answer.reload).to be_graded

          subject.questions.each do |question|
            all_answers = subject.answers.where(question: question)
            current_answer = all_answers.current_answers.select(&:attempting?).first
            last_non_current_answer = all_answers.reject(&:current_answer?).reject(&:attempting?).last
            expect(last_non_current_answer).not_to eq('attempting')
            expect(current_answer.specific.compare_answer(last_non_current_answer.specific)).to be_truthy
          end
        end
      end

      context 'when the submission gets unsubmitted and submitted again without change in answers' do
        let(:submission1_traits) { :submitted }

        it 'duplicates all submitted current answers in the submission to attempting' do
          current_answer_ids_before = subject.current_answers.pluck(:id)
          unsubmit_and_save_subject
          current_answer_ids_intermediate = subject.current_answers.pluck(:id)
          subject.finalise!
          current_answer_ids_after = subject.current_answers.pluck(:id)

          expect(subject.answers.length).to eq(7)
          expect(subject.current_answers.length).to eq(6)

          expect(current_answer_ids_before == current_answer_ids_after).to be_truthy
          expect(current_answer_ids_before == current_answer_ids_intermediate).to be_falsey
          expect(current_answer_ids_after == current_answer_ids_intermediate).to be_falsey
        end
      end

      context 'when the submission gets unsubmitted and submitted again with change in answers' do
        let(:submission1_traits) { :submitted }

        it 'duplicates all submitted current answers in the submission to attempting' do
          current_answer_ids_before = subject.current_answers.pluck(:id)
          unsubmit_and_save_subject
          current_answer_ids_intermediate = subject.current_answers.pluck(:id)

          # Update/change the answers of all current_answers
          subject.current_answers.each do |current_answer|
            answer = current_answer.specific
            case answer.class.name
            when 'Course::Assessment::Answer::MultipleResponse'
              question = answer.question.actable
              correct_options = question.options.select(&:correct)
              correct_options.each { |option| answer.options << option }
            when 'Course::Assessment::Answer::Programming'
              answer.files.each do |file|
                file.update(content: 'updated')
              end
            when 'Course::Assessment::Answer::TextResponse'
              answer.update(answer_text: 'updated')
            when 'Course::Assessment::Answer::ForumPostResponse'
              answer.update(answer_text: '<div>yyy</div>')
            end
          end

          subject.finalise!
          current_answer_ids_after = subject.current_answers.pluck(:id)

          expect(subject.answers.length).to eq(13)
          expect(subject.current_answers.length).to eq(6)

          expect(current_answer_ids_before == current_answer_ids_after).to be_falsey
          expect(current_answer_ids_before == current_answer_ids_intermediate).to be_falsey
          expect(current_answer_ids_after == current_answer_ids_intermediate).to be_falsey
        end
      end

      context 'when the submission is published' do
        let(:submission1_traits) { :published }
        before do
          submission1.points_awarded = 200
          submission1.save!
        end

        it 'resets experience points, submitted_at, publish_at and publisher attributes' do
          expect(subject.points_awarded).not_to be_nil
          expect(subject.submitted_at).not_to be_nil
          expect(subject.published_at).not_to be_nil
          expect(subject.publisher).not_to be_nil
          unsubmit_and_save_subject
          expect(subject.points_awarded).to be_nil
          expect(subject.submitted_at).to be_nil
          expect(subject.published_at).to be_nil
          expect(subject.publisher).to be_nil
        end

        it 'sets all current answers in the submission to attempting' do
          unsubmit_and_save_subject
          expect(subject.current_answers.all?(&:attempting?)).to be(true)
          expect(earlier_answer.reload).to be_graded
        end
      end
    end

    describe '#resubmit_programming!' do
      let(:assessment_traits) { [:with_all_question_types, :autograded] }
      let!(:earlier_answer) do
        answer = create(:course_assessment_answer_multiple_response, :graded,
                        assessment: assessment,
                        question: assessment.multiple_response_questions.first.acting_as,
                        submission: submission1, creator: user1).acting_as
        answer.update_column(:created_at, 1.day.ago)
        submission1.reload
        # Submission creates a grading job which could make answers go to the graded state, need to
        # wait for them to finish.
        wait_for_job
        answer
      end

      subject { submission1 }

      context 'when the submission is published' do
        let(:submission1_traits) { :published }
        before do
          submission1.points_awarded = 200
          submission1.save!
        end

        it 'resets experience points, publish_at and publisher attributes, but not submitted_at' do
          expect(subject.points_awarded).not_to be_nil
          expect(subject.submitted_at).not_to be_nil
          original_submitted_at = subject.submitted_at
          expect(subject.published_at).not_to be_nil
          expect(subject.publisher).not_to be_nil
          subject.resubmit_programming!
          expect(subject.points_awarded).to be_nil
          expect(subject.submitted_at).to equal(original_submitted_at)
          expect(subject.published_at).to be_nil
          expect(subject.publisher).to be_nil
        end

        it 'sets only current programming answers in the submission to submitted' do
          subject.resubmit_programming!
          expect(subject.current_programming_answers.all?(&:submitted?)).to be true
          other_answers = subject.current_answers.reject { |ans| ans.actable_type =~ /Programming/ }
          expect(other_answers.all?(&:graded?)).to be true
        end
      end
    end

    describe '#current_points_awarded' do
      let(:assessment_traits) { [:published_with_mcq_question] }
      let(:submission1_traits) { [:submitted] }
      let(:points_awarded) { 100 }
      let(:draft_points_awarded) { 50 }
      subject { submission1.current_points_awarded }
      before do
        submission1.points_awarded = points_awarded
        submission1.draft_points_awarded = draft_points_awarded
      end

      context 'when submission is published' do
        it 'returns the correct value' do
          submission1.publish!
          expect(subject).to eq(points_awarded)
        end
      end

      context 'when submission is graded' do
        it 'returns the correct value' do
          submission1.mark!
          expect(subject).to eq(draft_points_awarded)
        end
      end
    end

    describe '#send_submit_notification' do
      subject do
        submission1.save
        submission1.updater = user1
        submission1.send(:send_submit_notification)
      end

      it 'sends the email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end
    end

    describe '#on_dependent_status_change' do
      subject do
        create(:submission, :graded,
               assessment: assessment, creator: user1, course_user: course_student1)
      end

      let(:answer) do
        create(:course_assessment_answer_multiple_response, :submitted,
               assessment: assessment, question: assessment.questions.first,
               submission: subject, creator: user1).acting_as
      end

      context 'when an answer\'s grade changes' do
        before do
          subject.publish!
          subject.save!
        end

        it 'updates the last_graded_time' do
          answer.grade = 0
          expect(subject.saved_changes).to include(:last_graded_time)
          answer.save!
          subject.save!
        end
      end
    end

    describe 'callbacks from Course::Assessment::Submission::TodoConcern' do
      let(:assessment_traits) { [:published_with_mcq_question] }
      subject do
        Course::LessonPlan::Todo.
          find_by(item_id: assessment.lesson_plan_item.id, user_id: user1.id)
      end
      before { submission1 }

      context 'when submission is created' do
        let(:submission1_traits) { [:attempting] }
        it 'transitions the todo to in progress' do
          expect(subject.in_progress?).to be_truthy
        end
      end

      context 'when submission transitions from attempting to submitted' do
        let(:submission1_traits) { [:attempting] }
        it 'transitions the todo to completed' do
          submission1.finalise!
          submission1.save!
          expect(subject.completed?).to be_truthy
        end
      end

      context 'when submission is unsubmitted' do
        let(:submission1_traits) { [:submitted] }
        it 'transitions the todo to in progress' do
          submission1.unsubmit!
          submission1.save!
          expect(subject.in_progress?).to be_truthy
        end
      end

      context 'when submission is destroyed' do
        let(:submission1_traits) { [:attempting] }
        it 'changes todo state to not started' do
          submission1.destroy
          expect(subject.not_started?).to be_truthy
        end
      end

      context 'when assessment is destroyed' do
        let!(:submission1_traits) { [:published] }
        let!(:submission2_traits) { [:graded] }
        let!(:submission3_traits) { [:submitted] }

        it 'deletes all todos' do
          item_id = assessment.lesson_plan_item.id
          assessment.destroy
          expect(Course::LessonPlan::Todo.find_by(item_id: item_id, user_id: user1.id)).to be_nil
          expect(Course::LessonPlan::Todo.find_by(item_id: item_id, user_id: user2.id)).to be_nil
          expect(Course::LessonPlan::Todo.find_by(item_id: item_id, user_id: user3.id)).to be_nil
        end
      end
    end
  end
end
