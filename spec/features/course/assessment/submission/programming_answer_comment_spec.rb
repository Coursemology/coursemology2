# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Programming Answers: Commenting' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, user: student)
    end
    before { login_as(user, scope: :user) }

    context 'As a course student' do
      let(:user) { student }

      scenario 'I can annotate my answer after submitting', js: true do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        code = <<-PYTHON
          def test:
            pass
        PYTHON
        find('.ace_text-input', visible: false).set(code) # because fill_in does not work with Ace.
        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')
        wait_for_job

        annotation = 'test annotation text'
        within find(content_tag_selector(submission.answers.first)) do
          first_line = find('table.codehilite tr', match: :first)
          first_line.hover

          annotation_button = find('span.add-annotation', match: :first)
          annotation_button.click
          expect(page).to have_tag('td.line-annotation', count: 1)
          expect(page).to have_tag('div.annotation-form', count: 1)

          # Test that only one annotation row is created for every line.
          annotation_button.click
          expect(page).to have_tag('td.line-annotation', count: 1)

          # Test that only one annotation form is created no matter how many times we click on
          # the add annotation button.
          expect(page).to have_tag('div.annotation-form', count: 1)

          # Test that we can annotate another line.
          another_line = all('table.codehilite tr')[2]
          another_line.hover
          another_line_annotation_button = find('span.add-annotation', match: :first)
          another_line_annotation_button.click
          expect(page).to have_tag('div.annotation-form', count: 2)

          click_button I18n.t('javascript.course.assessment.submission.answer.programming.'\
                              'annotation_form.reset'), match: :first
          expect(page).to have_tag('.annotation-form', count: 1)

          find_field('discussion_post[text]').set annotation
          click_button I18n.t('javascript.course.assessment.submission.answer.programming.'\
                              'annotation_form.submit')
          wait_for_ajax
        end

        answer_file = submission.answers.first.actable.files.first
        answer_discussion_topic = answer_file.annotations.first.discussion_topic
        expect(answer_discussion_topic.posts.first.text).to eq(annotation)

        expect(page).to have_content_tag_for(answer_discussion_topic.posts.first)
      end
    end
  end
end
