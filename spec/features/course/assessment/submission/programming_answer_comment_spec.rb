# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Assessment: Submissions: Programming Answers: Commenting' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:student) { create(:course_user, :approved, course: course).user }
    let(:submission) do
      create(:course_assessment_submission, assessment: assessment, creator: student)
    end
    before { login_as(user, scope: :user) }

    context 'As a course student' do
      let(:user) { student }
      let(:answers) { assessment.questions.attempt(submission) }
      let(:annotation) do
        file = answers.first.actable.files.first
        file.content = "test\n\n\n\nlines"
        answers.each(&:save!)

        submission.finalise!
        submission.publish!
        submission.save!

        file.annotations.build(line: 1)
      end

      scenario 'I can annotate my answer after submitting', js: true do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        code = <<-PYTHON
          def test:
            pass
        PYTHON
        within find(content_tag_selector(submission.answers.first)) do
          find('textarea.code').set code
        end
        click_button I18n.t('course.assessment.submission.submissions.worksheet.finalise')
        wait_for_job

        annotation = 'test annotation text'
        within find(content_tag_selector(submission.answers.first)).find('div.files') do
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

          fill_in 'discussion_post[text]', with: annotation
          click_button I18n.t('javascript.course.assessment.submission.answer.programming.'\
                              'annotation_form.submit')
          wait_for_ajax
        end

        answer_file = submission.answers.first.actable.files.first
        answer_discussion_topic = answer_file.annotations.first.discussion_topic
        expect(answer_discussion_topic.posts.first.text).to have_tag('*', text: annotation)

        expect(page).to have_content_tag_for(answer_discussion_topic.posts.first)
      end

      scenario 'I can reply to an existing annotation post', js: true do
        post = create(:course_discussion_post, topic: annotation.discussion_topic, creator: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)
        within find(content_tag_selector(post)) do
          find('.reply').click
        end

        annotation_text = 'reply annotation'
        within find_form('.annotation-form') do
          fill_in 'discussion_post[text]', with: annotation_text
          click_button I18n.t('javascript.course.assessment.submission.answer.programming.'\
                              'annotation_form.submit')
        end

        wait_for_ajax
        new_post = post.children.reload.last
        expect(new_post.text).to have_tag('*', text: annotation_text)
      end

      scenario 'I can reply to an existing annotation topic', js: true do
        create(:course_discussion_post, topic: annotation.discussion_topic, creator: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)
        find(content_tag_selector(annotation.discussion_topic)).find('.reply-annotation').click

        annotation_text = 'annotation'
        within find_form('.annotation-form') do
          fill_in 'discussion_post[text]', with: annotation_text
          click_button I18n.t('javascript.course.assessment.submission.answer.programming.'\
                              'annotation_form.submit')
        end

        wait_for_ajax
        new_post = annotation.posts.last
        expect(new_post.text).to have_tag('*', text: annotation_text)
      end

      scenario 'I can delete my annotations', js: true do
        post = create(:course_discussion_post, topic: annotation.discussion_topic, creator: user)

        visit edit_course_assessment_submission_path(course, assessment, submission)

        expect(page).to have_content_tag_for(post)
        within find(content_tag_selector(post)) do
          find('.delete').click
        end

        wait_for_ajax
        expect(page).not_to have_content_tag_for(post)
      end
    end
  end
end
