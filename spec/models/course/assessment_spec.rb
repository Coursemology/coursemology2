# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to belong_to(:tab).without_validating_presence }
  it { is_expected.to belong_to(:monitor).without_validating_presence }
  it { is_expected.to have_many(:questions) }
  it { is_expected.to have_many(:multiple_response_questions).through(:questions) }
  it { is_expected.to have_many(:text_response_questions).through(:questions) }
  it { is_expected.to have_many(:programming_questions).through(:questions) }
  it { is_expected.to have_many(:scribing_questions).through(:questions) }
  it { is_expected.to have_many(:forum_post_response_questions).through(:questions) }
  it { is_expected.to have_many(:submissions).dependent(:destroy) }
  it { is_expected.to have_many(:conditions) }
  it { is_expected.to have_many(:assessment_conditions).dependent(:destroy) }
  it { is_expected.to have_one(:duplication_traceable).dependent(:destroy) }

  it { should delegate_method(:source).to(:duplication_traceable).allow_nil }
  it { should delegate_method(:source=).to(:duplication_traceable).with_arguments(nil).allow_nil }

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
      context 'when it is published' do
        context 'when it has no questions' do
          # This used to be invalid, but some instructors create assessments to provide
          # instructions for tasks outside of Coursemology.
          #
          # See https://github.com/Coursemology/coursemology2/issues/2387
          subject { build(:assessment, published: true) }
          it { is_expected.to be_valid }
        end

        context 'when it has questions' do
          subject { build(:assessment, :with_all_question_types, published: false) }
          it { is_expected.to be_valid }
        end
      end

      context 'when it is not published' do
        context 'when it has no questions' do
          subject { build(:assessment, published: false) }
          it { is_expected.to be_valid }
        end

        context 'when it has questions' do
          subject { build(:assessment, :with_all_question_types, published: false) }
          it { is_expected.to be_valid }
        end
      end

      context 'when an autograded assessment is set to be published' do
        let(:assessment_traits) { [:autograded] }
        let!(:question) do
          create(:course_assessment_question_programming, *question_traits, assessment: assessment)
        end
        subject do
          assessment.published = true
          assessment
        end

        context 'when the assessment has a non-autograded question' do
          let(:question_traits) { nil }
          it { is_expected.to be_valid }
        end

        context 'when the assessment only has autograded questions' do
          let(:question_traits) { [:auto_gradable] }
          it { is_expected.to be_valid }
        end
      end

      context 'when re-parented to another tab in a different course' do
        let!(:other_tab) do
          other_course = create(:course)
          create(:course_assessment_tab, course: other_course)
        end

        it 'is invalid' do
          assessment.tab_id = other_tab.id
          expect(assessment).to be_invalid
          expect(assessment.errors[:tab]).to include(
            I18n.t('activerecord.errors.models.course/assessment.attributes.tab.not_in_same_course')
          )
        end
      end
    end

    describe 'callbacks' do
      describe 'after assessment was initialized' do
        context 'if the assessment is a new record' do
          subject { build(:assessment) }

          it 'sets the course of the lesson plan item' do
            assessment = create(:assessment, course: course)
            expect(assessment.course).to eq(assessment.tab.category.course)
          end
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
          expect(subject.folder.start_at).to be_within(1.second).of(new_start_at)
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
              # In actual use, load_or_create_answers in the Submission update service sets
              # current_answer to true.
              answers.map { |ans| ans.current_answer = true }
              answers.each(&:save)
              submission.answers << answers
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
              # In actual use, load_or_create_answers in the Submission update service sets
              # current_answer to true.
              answers.map { |ans| ans.current_answer = true }
              answers.each(&:save)
              submission.answers << answers
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

    describe '.ordered_by_date_and_title' do
      let(:course) { create(:course) }
      let(:start_at) { DateTime.new(2017, 1, 1).utc }
      let!(:assessment1) do
        create(:assessment, title: 'A', course: course, start_at: start_at)
      end
      let!(:assessment2) do
        create(:assessment, title: 'B', course: course, start_at: start_at)
      end
      let!(:assessment3) do
        create(:assessment, title: 'A', course: course, start_at: start_at + 1.day)
      end

      it 'orders the assessments by date and title' do
        expect(course.assessments.ordered_by_date_and_title).
          to eq([assessment1, assessment2, assessment3])
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
        # notes(rtang): not sure what is this trying to test, since the order here dependents
        # on the order of assessments rather than submission.
        # expect(submissions.each_cons(2).all? { |a, b| a.created_at >= b.created_at }).to be(true)
      end
    end

    context 'when there is a name conflict with other assessment in the same category' do
      let(:common_title) { 'Mission Impossible' }
      let!(:tab) { create(:assessment, title: common_title).tab }

      context 'after assessment was saved' do
        subject { build(:assessment, title: common_title, tab: tab) }
        it 'create a folder with proper name' do
          subject.save

          expect(subject.folder.name).to eq("#{common_title} (0)")
        end
      end

      context 'after assessment was changed' do
        subject { create(:assessment, title: common_title, tab: tab) }

        it 'updates the folder with proper name' do
          subject.title = common_title
          subject.save

          expect(subject.folder.name).to eq("#{common_title} (0)")
        end
      end
    end

    describe '#update_mode' do
      let(:autograded_assessment) do
        build(:assessment, :autograded, skippable: true)
      end

      let(:manually_graded_assessment) do
        build(:assessment, session_password: 'LOL', view_password: 'hehe')
      end

      it 'switches to autograded mode' do
        params = { autograded: true }
        manually_graded_assessment.update_mode(params)

        expect(manually_graded_assessment).to be_autograded
        expect(manually_graded_assessment.session_password).to be_nil
        expect(manually_graded_assessment.view_password).to be_nil
      end

      it 'switches to manually graded mode' do
        params = { autograded: false }
        autograded_assessment.update_mode(params)

        expect(autograded_assessment).not_to be_autograded
        expect(autograded_assessment.skippable).to be_falsy
      end

      it 'does not change the mode when params is blank' do
        params = {}
        autograded_assessment.update_mode(params)

        expect(autograded_assessment).to be_autograded
        expect(autograded_assessment.skippable).to be_truthy
      end
    end

    describe '.max_grades' do
      let(:assessment_with_question) do
        create(:assessment, :with_mcq_question, course: course)
      end

      it 'returns empty hash for empty assessment_ids' do
        expect(Course::Assessment.max_grades([])).to eq({})
      end

      it 'returns the sum of maximum_grades for each assessment' do
        assessment_with_question
        result = Course::Assessment.max_grades([assessment_with_question.id])
        expected = assessment_with_question.questions.sum(:maximum_grade).to_f
        expect(result[assessment_with_question.id]).to eq(expected)
      end

      it 'excludes assessments not in the given ids' do
        other = create(:assessment, :with_mcq_question, course: course)
        result = Course::Assessment.max_grades([assessment_with_question.id])
        expect(result.keys).not_to include(other.id)
      end

      it 'excludes assessments with no questions from the result' do
        empty_assessment = create(:assessment, course: course)
        result = Course::Assessment.max_grades([empty_assessment.id])
        expect(result).not_to have_key(empty_assessment.id)
      end
    end

    describe '.titles_in_course' do
      let(:course) { create(:course) }

      it 'returns the downcased titles of every assessment in the course' do
        create(:assessment, course: course, title: 'Lab 3')
        create(:assessment, course: course, title: 'Tutorial 1')

        expect(described_class.titles_in_course(course)).
          to contain_exactly('lab 3', 'tutorial 1')
      end

      # A duplicate title two tabs away is exactly as confusing as one in the same tab, so the whole
      # course is the collision scope.
      it 'spans every tab and category in the course' do
        other_category = create(:course_assessment_category, course: course)
        other_tab = create(:course_assessment_tab, category: other_category)
        create(:assessment, course: course, title: 'Lab 3')
        create(:assessment, course: course, tab: other_tab, title: 'Lab 4')

        expect(described_class.titles_in_course(course)).
          to contain_exactly('lab 3', 'lab 4')
      end

      it 'ignores assessments in other courses' do
        create(:assessment, course: course, title: 'Lab 3')
        create(:assessment, course: create(:course), title: 'Foreign Lab')

        expect(described_class.titles_in_course(course)).to eq(['lab 3'])
      end

      # The in-place update overwrites an assessment's OWN title, so it must not collide with itself.
      it 'excludes the named assessment' do
        create(:assessment, course: course, title: 'Lab 3')
        self_assessment = create(:assessment, course: course, title: 'Lab 4')

        expect(described_class.titles_in_course(course, except_id: self_assessment.id)).
          to eq(['lab 3'])
      end

      it 'returns an empty array for a course with no assessments' do
        expect(described_class.titles_in_course(create(:course))).to eq([])
      end
    end

    describe '#submission_counts_by_author' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, :with_mcq_question, course: course) }

      it 'is all zeroes for an assessment nobody has attempted' do
        expect(assessment.submission_counts_by_author).to eq(student: 0, other: 0)
      end

      # A real student's work blocks the in-place update in ANY workflow state - an untouched
      # `attempting` draft is still their attempt.
      it 'counts a non-phantom student attempt, even while merely attempting' do
        student = create(:course_student, course: course)
        create(:submission, :attempting, assessment: assessment, creator: student.user)

        expect(assessment.submission_counts_by_author).to eq(student: 1, other: 0)
      end

      it 'counts a submitted student submission' do
        student = create(:course_student, course: course)
        create(:submission, :submitted, assessment: assessment, creator: student.user)

        expect(assessment.submission_counts_by_author).to eq(student: 1, other: 0)
      end

      # An instructor's own test run must not permanently cost them the update option.
      it 'counts a manager test run as other, not student' do
        manager = create(:course_manager, course: course)
        create(:submission, :attempting, assessment: assessment, creator: manager.user)

        expect(assessment.submission_counts_by_author).to eq(student: 0, other: 1)
      end

      it 'counts a phantom student test run as other, not student' do
        phantom = create(:course_student, :phantom, course: course)
        create(:submission, :attempting, assessment: assessment, creator: phantom.user)

        expect(assessment.submission_counts_by_author).to eq(student: 0, other: 1)
      end

      # A submission whose author has since left the course has no course_user row to classify it.
      # It must land in `other` rather than vanishing from both counts.
      it 'counts a submission by a departed user as other' do
        student = create(:course_student, course: course)
        create(:submission, :attempting, assessment: assessment, creator: student.user)
        student.destroy!

        expect(assessment.submission_counts_by_author).to eq(student: 0, other: 1)
      end

      it 'counts a submission by a soft-deleted course user as other' do
        student = create(:course_student, course: course)
        create(:submission, :attempting, assessment: assessment, creator: student.user)
        student.update!(deleted_at: Time.zone.now)

        expect(assessment.submission_counts_by_author).to eq(student: 0, other: 1)
      end

      it 'ignores submissions on a different assessment' do
        other_assessment = create(:assessment, :with_mcq_question, course: course)
        student = create(:course_student, course: course)
        create(:submission, :attempting, assessment: other_assessment, creator: student.user)

        expect(assessment.submission_counts_by_author).to eq(student: 0, other: 0)
      end
    end

    describe 'in-transaction marketplace authoring re-point' do
      # The re-point enqueues nothing, but the env default is `:background_thread` — a real thread
      # sharing this example's connection — and these examples assert on row counts in the container.
      with_active_job_queue_adapter(:test) do
        let(:listing) do
          create(:course_assessment_marketplace_listing, :versioned, course: course)
        end

        def container
          ActsAsTenant.without_tenant do
            Course::Assessment::Marketplace::PreviewContainerService.container_course
          end
        end

        def container_assessment_count
          ActsAsTenant.without_tenant { container.assessments.count }
        end

        # Gives +listing+ a snapshot in the CONTAINER, where a real published one lives. The
        # `:versioned` factory's stand-in snapshot sits in the origin course instead, which the
        # course-deletion examples cannot use: destroying the course would take the snapshot with it
        # and trip the version row's foreign key — a collision the production layout makes impossible.
        #
        # @return [Course::Assessment] the snapshot
        def snapshot_in_container(listing)
          snapshot = ActsAsTenant.with_tenant(container.instance) do
            create(:assessment, course: container)
          end
          version = create(:course_assessment_marketplace_listing_version,
                           listing: listing, assessment: snapshot,
                           published_at: listing.first_published_at || Time.zone.now,
                           published_by: listing.publisher)
          listing.update!(current_version: version)
          snapshot
        end

        it 'points the listing at a fresh draft copy in the marketplace container' do
          listed_assessment = listing.authoring_assessment

          listed_assessment.destroy!

          copy = listing.reload.authoring_assessment
          expect(copy).to be_present
          expect(copy.id).not_to eq(listed_assessment.id)
          expect(ActsAsTenant.without_tenant { copy.course }).to eq(container)
          expect(listing).not_to be_orphaned
          # The assessment the user deleted is gone. Re-pointing is not undeletion.
          expect(Course::Assessment.where(id: listed_assessment.id)).to be_empty
          # A published copy in the container would be visible to previewers. Holds because
          # ObjectDuplicationService's object-mode default is `unpublish_all: true`.
          expect(copy.published).to be(false)
        end

        it 'clones the snapshot rather than the assessment being deleted' do
          listed_assessment = listing.authoring_assessment
          snapshot = ActsAsTenant.without_tenant { listing.current_version.assessment }
          snapshot_title = snapshot.title
          listed_assessment.update!(title: 'Drifted since publication')

          listed_assessment.destroy!

          copy = listing.reload.authoring_assessment
          expect(copy).to be_present
          expect(copy.title).to eq(snapshot_title)
          expect(copy.id).not_to eq(snapshot.id)
          expect(snapshot.reload).to be_persisted
          # The clone inherits the snapshot's duplication root rather than starting a tree of its own,
          # so everything descended from the original source stays comparable for plagiarism. The link
          # rows are what must not cross an instance boundary, and `#initialize_duplicate` handles that.
          expect(copy.linkable_tree_id).to eq(snapshot.linkable_tree_id)
        end

        it 'cuts no version and leaves the current version alone' do
          listed_assessment = listing.authoring_assessment
          current_version_id = listing.current_version_id

          expect { listed_assessment.destroy! }.
            not_to(change { Course::Assessment::Marketplace::ListingVersion.where(listing_id: listing.id).count })
          expect(listing.reload.current_version_id).to eq(current_version_id)
        end

        # The in-transaction proof. The re-point is visible mid-destroy — which an `after_commit` job
        # could never manage — and a rollback takes the copy with it, leaving the listing pointing at
        # the assessment that survived.
        it 'unwinds the copy when the destroy that triggered it fails' do
          listed_assessment = listing.authoring_assessment
          original_id = listing.authoring_assessment_id
          copies_before = container_assessment_count

          ActiveRecord::Base.transaction(requires_new: true) do
            listed_assessment.destroy!

            expect(listing.reload.authoring_assessment).to be_present
            expect(listing.reload.authoring_assessment_id).not_to eq(original_id)

            raise ActiveRecord::Rollback
          end

          expect(listing.reload.authoring_assessment_id).to eq(original_id)
          expect(listed_assessment.reload).to be_persisted
          expect(container_assessment_count).to eq(copies_before)
        end

        # A course deletion cascades to its assessments through Ruby `dependent: :destroy`
        # (course -> categories -> tabs -> assessments), so the one hook on the assessment is the
        # single choke point for both ways a listing loses its source.
        it 'points the listing at a container copy when the whole origin course is deleted' do
          listing_in_course = create(:course_assessment_marketplace_listing, course: course)
          snapshot = snapshot_in_container(listing_in_course)

          course.destroy!

          copy = listing_in_course.reload.authoring_assessment
          expect(copy).to be_present
          expect(copy.id).not_to eq(snapshot.id)
          expect(ActsAsTenant.without_tenant { copy.course }).to eq(container)
          expect(listing_in_course).not_to be_orphaned
        end

        # One transaction, two listings: whichever assessment is destroyed first must not leave the
        # second's re-point unrun, and the two must not collide over the container.
        it 'points every listing in a deleted course at its own container copy' do
          first = create(:course_assessment_marketplace_listing, course: course)
          second = create(:course_assessment_marketplace_listing, course: course)
          snapshot_in_container(first)
          snapshot_in_container(second)

          course.destroy!

          expect(first.reload).not_to be_orphaned
          expect(second.reload).not_to be_orphaned
          expect(first.authoring_assessment_id).not_to eq(second.authoring_assessment_id)
          [first, second].each do |listing|
            expect(ActsAsTenant.without_tenant { listing.authoring_assessment.course }).to eq(container)
          end
        end

        # There is nothing to clone FROM, so this listing is left orphaned — and it is the DB foreign
        # key that nullifies the column, not a Ruby callback (see the association guard below). Its
        # only route out is the admin's deletion.
        it 'orphans a listing that has never published a version' do
          versionless = create(:course_assessment_marketplace_listing, course: course)
          listed_assessment = versionless.authoring_assessment

          expect { listed_assessment.destroy! }.to change(Course::Assessment, :count).by(-1)

          expect(versionless.reload).to be_orphaned
          expect(Course::Assessment::Marketplace::Listing.where(id: versionless.id)).to exist
        end

        it 'destroys an assessment that authors no listing without cloning anything' do
          assessment

          expect { assessment.destroy! }.to change(Course::Assessment, :count).by(-1)
        end
      end
    end
  end
end
