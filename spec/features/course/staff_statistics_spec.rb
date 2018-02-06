# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Statistics: Staff' do
  subject { page }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Staff' do
      let(:tutor1) { create(:course_teaching_assistant, course: course) }
      let(:tutor2) { create(:course_teaching_assistant, course: course) }
      let!(:tutor3) { create(:course_teaching_assistant, course: course) }
      let(:student) { create(:course_student, course: course) }
      let(:user) { tutor1.user }

      # Create submissions for tutors, with given submitted at and published_at
      let!(:tutor1_submissions) do
        submitted_at = 1.day.ago
        published_at = submitted_at + 1.day + 1.hour + 1.minute + 1.second
        assessment = create(:assessment, :with_mcq_question, course: course)
        submission = create(:submission, :published,
                            assessment: assessment, course: course, publisher: tutor1.user,
                            published_at: published_at, submitted_at: submitted_at)
        create(:course_assessment_answer_multiple_response, :graded,
               assessment: assessment, submission: submission, submitted_at: submitted_at)
        [submission]
      end

      let!(:tutor2_submissions) do
        submitted_at = 2.days.ago
        published_at = submitted_at + 2.days
        assessment = create(:assessment, :with_mcq_question, course: course)
        submission = create(:submission, :published,
                            assessment: assessment, course: course, publisher: tutor2.user,
                            published_at: published_at, submitted_at: submitted_at)
        create(:course_assessment_answer_multiple_response, :graded,
               assessment: assessment, submission: submission, submitted_at: submitted_at)
        [submission]
      end

      let!(:tutor3_submissions) do
        submitted_at, published_at = 2.days.ago, 2.days.ago
        assessment = create(:assessment, :with_mcq_question, course: course)
        submission = create(:submission, :published,
                            assessment: assessment, course: course, publisher: tutor3.user,
                            published_at: published_at, submitted_at: submitted_at,
                            creator: tutor3.user)
        create(:course_assessment_answer_multiple_response, :graded,
               assessment: assessment, submission: submission, submitted_at: submitted_at)
        [submission]
      end

      scenario 'I can view staff summary' do
        visit course_statistics_staff_path(course)

        expect(page).to have_selector('li', text: I18n.t('course.statistics.staff.header'))

        within find(content_tag_selector(tutor1)) do
          expect(page).to have_selector('td', text: '1') # S/N
          expect(page).to have_selector('td', text: tutor1.name)
          expect(page).to have_selector('td', text: tutor1_submissions.size)
          expect(page).to have_selector('td', text: "1 #{I18n.t('time.day')} 01:01:01")
        end

        within find(content_tag_selector(tutor2)) do
          expect(page).to have_selector('td', text: '2')
          expect(page).to have_selector('td', text: tutor2.name)
          expect(page).to have_selector('td', text: tutor2_submissions.size)
          expect(page).to have_selector('td', text: "2 #{I18n.t('time.day')} 00:00:00")
        end

        # Do not show reflect staff submissions as part of staff statistics.
        within find(content_tag_selector(tutor3)) do
          expect(page).to have_selector('td', text: '3')
          expect(page).to have_selector('td', text: tutor3.name)
          expect(page).to have_selector('td', text: '0')
          expect(page).to have_selector('td', text: '--:--:--')
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I cannot see the sidebar item' do
        visit course_path(course)

        expect(page).not_to have_selector('li', text: I18n.t('course.statistics.staff.header'))
      end
    end
  end
end
