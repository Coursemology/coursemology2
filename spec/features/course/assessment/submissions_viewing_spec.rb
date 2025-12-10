# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Submissions Viewing', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }
    let(:autograded_assessment) do
      create(:assessment, :autograded, :with_mcq_question, course: course)
    end
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:course_manager) { create(:course_manager, course: course) }
      let(:user) { course_manager.user }

      scenario 'I can view all submitted and published submissions' do
        students = create_list(:course_student, 4, course: course)
        attempting_submission, submitted_submission, graded_submission, published_submission =
          students.zip([:attempting, :submitted, :graded, :published]).map do |student, trait|
            create(:submission, trait, assessment: assessment, creator: student.user)
          end
        staff_submission =
          create(:submission, :submitted, assessment: assessment, creator: course_manager.user)

        visit course_submissions_path(course)
        find("#category-tab-#{course.assessment_categories.first.id}").click

        expect(page).to have_selector('div.submissions-filter')

        # Submissions page should not show attempting submissions or staff submissions.
        expect(page).to have_no_content_tag_for(attempting_submission)
        expect(page).to have_no_content_tag_for(staff_submission)

        within find(content_tag_selector(submitted_submission)) do
          expect(page).to have_selector("#submission-button-#{submitted_submission.id}")
        end
        [graded_submission, published_submission].each do |submission|
          within find(content_tag_selector(submission)) do
            expect(page).to have_selector("#submission-button-#{submission.id}")
          end
        end
      end

      scenario 'I can view pending submissions from all non-autograded assessments' do
        students = create_list(:course_student, 4, course: course)
        attempting_submission, submitted_submission1, submitted_submission2, published_submission =
          students.zip([:attempting, :submitted, :submitted, :published]).map do |student, trait|
            create(:submission, trait, assessment: assessment, course: course,
                                       creator: student.user, course_user: student)
          end
        autograded_submission =
          create(:submission, :submitted, assessment: autograded_assessment,
                                          creator: students.first.user)

        # Create group users
        group = create(:course_group, course: course)
        create(:course_group_manager, group: group, course: course, course_user: course_manager)
        create(:course_group_user, group: group, course: course,
                                   course_user: submitted_submission1.course_user)

        # Staff without group can view all pending submissions
        visit course_submissions_path(course)
        find('#all-students-pending-tab').click

        expect(page).to have_content_tag_for(submitted_submission1)
        expect(page).to have_content_tag_for(submitted_submission2)
        expect(page).to have_no_content_tag_for(attempting_submission)
        expect(page).to have_no_content_tag_for(published_submission)

        # Pending submissions tab shows the tutors for the students if it exists.
        within find(content_tag_selector(submitted_submission1)) do
          expect(page).to have_text(course_manager.name)
        end

        # Pending submissions does not show submissions for autograded assessments
        expect(page).to have_no_content_tag_for(autograded_submission)

        # Staff with group view pending submissions of own group students
        find('#my-students-pending-tab').click

        expect(page).to have_content_tag_for(submitted_submission1)
        expect(page).to have_no_content_tag_for(submitted_submission2)
        expect(page).to have_no_content_tag_for(attempting_submission)
        expect(page).to have_no_content_tag_for(published_submission)

        expect(find_sidebar).
          to have_link('sidebar_item_assessments_submissions', href: course_submissions_path(course))
      end

      # COMMENTED OUT as it is not possible to select the options for filtering
      # Reimplement when switching test suite
      # scenario 'I can filter submissions' do
      #   # Create student, group and submission
      #   student = create(:course_student, course: course)
      #   group = create(:course_group, course: course)
      #   create(:course_group_manager, group: group, course: course, course_user: course_manager)
      #   create(:course_group_user, group: group, course: course, course_user: student)
      #   submission = create(:submission, :submitted, assessment: assessment, course: course,
      #                                                creator: student.user, course_user: student)
      #   visit course_submissions_path(course)

      #   # Filter submission by assessment
      #   within find_field('filter[assessment_id]') do
      #     select assessment.title
      #   end
      #   click_button I18n.t('common.submit')
      #   expect(page).to have_content_tag_for(submission)

      #   # Filter submission by group
      #   within find_field('filter[group_id]') do
      #     select group.name
      #   end
      #   click_button I18n.t('common.submit')
      #   expect(page).to have_content_tag_for(submission)

      #   # Filter submission by user
      #   within find_field('filter[user_id]') do
      #     select student.name
      #   end
      #   click_button I18n.t('common.submit')
      #   expect(page).to have_content_tag_for(submission)
      # end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view my submitted, graded and published submissions' do
        # Attach a submission of each trait to a unique assessment
        assessments = create_list(:course_assessment_assessment, 4, :with_mcq_question,
                                  course: course, published: true)
        attempting_submission, submitted_submission, graded_submission, published_submission =
          assessments.zip([:attempting, :submitted, :graded, :published]).map do |assessment, trait|
            create(:submission, trait, assessment: assessment, creator: user)
          end

        visit course_submissions_path(course)

        expect(page).to have_no_content_tag_for(attempting_submission)
        expect(page).not_to have_selector('div.submissions-filter')

        [submitted_submission, graded_submission, published_submission].each do |submission|
          within find(content_tag_selector(submission)) do
            expect(page).to have_selector("#submission-button-#{submission.id}")
            # Cannot see grades for graded submission
            expect(page).to have_text('--') if submission.graded?
          end
        end
      end

      scenario 'I cannot view submissions for draft assessments' do
        # Attach a submission of each trait to a unique assessment
        assessment = create(:course_assessment_assessment, :with_mcq_question, course: course)
        submission = create(:submission, :graded, assessment: assessment, creator: user)

        visit course_submissions_path(course)

        expect(page).not_to have_selector("#submission-button-#{submission.id}")
      end
    end
  end
end
