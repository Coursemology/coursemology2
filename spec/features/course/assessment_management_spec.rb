# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Assessments: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create an assessment', js: true do
        assessment_tab = create(:course_assessment_tab,
                                category: course.assessment_categories.first)
        assessment = build_stubbed(:assessment)

        visit course_assessments_path(course, category: assessment_tab.category,
                                              tab: assessment_tab)
        find('div.new-btn button').click

        expect(page).to have_selector('h3', text: 'New Assessment')

        fill_in 'title', with: assessment.title
        fill_in 'base_exp', with: assessment.base_exp
        first("input[name='start_at']").set(assessment.start_at.strftime('%d-%m-%Y'))
        find('button.btn-submit').click

        expect(page).not_to have_selector('h3', text: 'New Assessment')
        assessment_created = course.assessments.last
        expect(assessment_created.tab).to eq(assessment_tab)
        expect(assessment_created.title).to eq(assessment.title)
        expect(assessment_created.base_exp).to eq(assessment.base_exp)
        expect(page).to have_content_tag_for(assessment_created)
        expect(assessment_created).not_to be_autograded
      end

      scenario 'I can edit an assessment' do
        pending 'Implement frontend test'
        student = create(:course_student, course: course).user
        assessment = create(:assessment, :published_with_mrq_question,
                            course: course, start_at: 1.day.from_now)
        visit course_assessment_path(course, assessment)
        find_link(nil, href: edit_course_assessment_path(course, assessment)).click

        new_text = 'zzzz'
        fill_in 'assessment_title', with: new_text
        fill_in 'assessment_start_at', with: Time.zone.now
        fill_in 'assessment_end_at', with: Time.zone.now + 1.hour
        click_button 'submit'

        perform_enqueued_jobs
        wait_for_job

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('h1', text: new_text)

        emails = unread_emails_for(student.email).map(&:subject)
        opening_subject = '.notifiers.course.assessment_notifier.opening.'\
                          'course_notifications.email.subject'
        closing_subject = 'course.mailer.assessment_closing_reminder_email.subject'
        expect(emails).to include(opening_subject)
        expect(emails).to include(closing_subject)

        manager_emails = unread_emails_for(user.email).map(&:subject)
        reminder_subject = 'course.mailer.assessment_closing_summary_email.subject'
        expect(manager_emails).to include(reminder_subject)
      end

      scenario 'I can delete an assessment' do
        assessment = create(:assessment, course: course)
        category_id, tab_id = assessment.tab.category_id, assessment.tab_id
        visit course_assessment_path(course, assessment)

        expect { find(:css, 'div.page-header a.btn-danger').click }.
          to change { course.reload.assessments.count }.by(-1)
        expect(page).
          to have_current_path course_assessments_path(course, category: category_id, tab: tab_id)

        expect(page).not_to have_selector("#assessment_#{assessment.id}")
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Assessment Sidebar item' do
        visit course_path(course)

        assessment_sidebar = 'activerecord.attributes.course/assessment/category/title.default'
        expect(page).to have_selector('li', text: assessment_sidebar)
      end

      scenario 'I can see published assessments' do
        category = course.assessment_categories.first
        assessment = create(:assessment, :published_with_mrq_question,
                            course: course, tab: category.tabs.first)
        visit course_assessments_path(course)

        find_link(assessment.title, href: course_assessment_path(course, assessment)).click
        expect(current_path).to eq(course_assessment_path(course, assessment))
      end
    end
  end
end
