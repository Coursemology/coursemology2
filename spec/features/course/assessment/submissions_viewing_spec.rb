require 'rails_helper'

RSpec.describe 'Course: Submissions Viewing' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:course_assessment_assessment, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:course_manager) { create(:course_manager, course: course) }
      let(:user) { course_manager.user }

      scenario 'I can view all submitted and graded submissions' do
        students = create_list(:course_student, 3, course: course)
        attempting_submission, submitted_submission, graded_submission =
          students.zip([:attempting, :submitted, :graded]).map do |student, trait|
            create(:course_assessment_submission, trait,
                   assessment: assessment, creator: student.user)
          end

        visit course_submissions_path(course)

        expect(page).not_to have_content_tag_for(attempting_submission)

        within find(content_tag_selector(submitted_submission)) do
          expect(page).to have_link(
            I18n.t('course.assessment.submissions.submission.grade'),
            href: edit_course_assessment_submission_path(course, assessment, submitted_submission)
          )
        end
        within find(content_tag_selector(graded_submission)) do
          expect(page).to have_link(
            I18n.t('course.assessment.submissions.submission.view'),
            href: edit_course_assessment_submission_path(course, assessment, graded_submission)
          )
        end
      end

      scenario 'I can access pending submissions from the sidebar and view pending submissions' do
        students = create_list(:course_student, 4, course: course)
        attempting_submission, submitted_submission1, submitted_submission2, graded_submission =
          students.zip([:attempting, :submitted, :submitted, :graded]).map do |student, trait|
            create(:course_assessment_submission, trait,
                   assessment: assessment, course: course,
                   creator: student.user, course_user: student)
          end

        # Staff without group can view all pending submissions
        visit pending_course_submissions_path(course, my_students: false)
        expect(page).to have_content_tag_for(submitted_submission1)
        expect(page).to have_content_tag_for(submitted_submission2)
        expect(page).not_to have_content_tag_for(attempting_submission)
        expect(page).not_to have_content_tag_for(graded_submission)

        # Staff with group view pending submissions of own group students
        group = create(:course_group, course: course)
        create(:course_group_manager, group: group, course: course, course_user: course_manager)
        create(:course_group_user, group: group, course: course,
                                   course_user: submitted_submission1.course_user)
        visit pending_course_submissions_path(course, my_students: true)

        expect(page).to have_content_tag_for(submitted_submission1)
        expect(page).not_to have_content_tag_for(submitted_submission2)
        expect(page).not_to have_content_tag_for(attempting_submission)
        expect(page).not_to have_content_tag_for(graded_submission)

        # All Pending submissions can be assessed from the sidebar
        within find('.sidebar') do
          expect(page).
            to have_link(I18n.t('course.assessment.submissions.sidebar_title'),
                         href: pending_course_submissions_path(course, my_students: false))
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view my submitted and graded submissions' do
        # Attach a submission of each trait to a unique assessment
        assessments = create_list(:course_assessment_assessment, 3, course: course)
        attempting_submission, submitted_submission, graded_submission =
          assessments.zip([:attempting, :submitted, :graded]).map do |assessment, trait|
            create(:course_assessment_submission, trait,
                   assessment: assessment, creator: user)
          end

        visit course_submissions_path(course)

        expect(page).not_to have_content_tag_for(attempting_submission)

        [submitted_submission, graded_submission].each do |submission|
          within find(content_tag_selector(submission)) do
            expect(page).to have_link(
              I18n.t('course.assessment.submissions.submission.view'),
              href: edit_course_assessment_submission_path(course, submission.assessment,
                                                           submission)
            )
          end
        end
      end
    end
  end
end
