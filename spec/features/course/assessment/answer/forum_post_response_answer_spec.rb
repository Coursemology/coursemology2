# frozen_string_literal: true
require 'rails_helper'

# TODO: Look into internationalising some of the strings being checked below.
RSpec.describe 'Course: Assessments: Submissions: Forum Post Response Answers', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_forum_post_response_question, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }

    before { login_as(user, scope: :user) }

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can save my answer text submission' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        answer_id = submission.answers.first.id
        react_ck_selector = "textarea[name=\"#{answer_id}.answer_text\"]"
        expect(page).to have_selector(react_ck_selector, visible: false)
        fill_in_react_ck react_ck_selector, ''
        fill_in_react_ck react_ck_selector, 'Testing Autosave'
        expect(page).to have_text('Testing Autosave')
        wait_for_autosave

        expect(submission.current_answers.first.specific.reload.answer_text).to include('Testing Autosave')
      end

      scenario 'I cannot update my answer text after finalising' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        answer_id = submission.answers.first.id
        react_ck_selector = "textarea[name=\"#{answer_id}.answer_text\"]"
        expect(page).to have_selector(react_ck_selector, visible: false)
        fill_in_react_ck react_ck_selector, ''
        fill_in_react_ck react_ck_selector, 'Testing Finalising'
        expect(page).to have_text('Testing Finalising')
        click_button('Finalise Submission')
        accept_confirm_dialog do
          wait_for_job
        end
        expect(page).not_to have_field(name: "#{answer_id}.answer_text]")
      end

      scenario 'I cannot see the text box for a question with answer text disabled' do
        question = assessment.questions.first.actable
        question.has_text_response = false
        question.save!

        visit edit_course_assessment_submission_path(course, assessment, submission)
        answer_id = submission.answers.first.id
        expect(page).not_to have_field(name: "#{answer_id}.answer_text")
      end

      scenario 'I can see a modal for selecting forum posts' do
        visit edit_course_assessment_submission_path(course, assessment, submission)

        expect(page).not_to have_text('You have selected 0/1 post.')
        click_button('Select Forum Post')
        expect(page).to have_text('You have selected 0/1 post.')
      end

      scenario 'I am informed of the lack of forum posts to select' do
        visit edit_course_assessment_submission_path(course, assessment, submission)
        click_button('Select Forum Post')
        expect(page).to have_text('You currently do not have any posts. Create one on the forums now!')
      end

      scenario 'I am able to see and select my forum posts' do
        topic = create(:forum_topic, course: course)
        forum_post = create(:course_discussion_post, topic: topic.acting_as, creator: user)
        visit edit_course_assessment_submission_path(course, assessment, submission)
        click_button('Select Forum Post')
        expect(page).to have_text(topic.forum.name)
        find('div.forum-card').click
        expect(page).to have_text(topic.title)
        find('div.topic-card').click
        expect(page).to have_text(forum_post.text)
        find('div.forum-post-option').click
        wait_for_page
        expect(find('div.forum-post').style('background-color')['background-color']).to eq('rgba(232, 245, 233, 1)')
        expect(page).to have_text('You have selected 1/1 post.')
        expect(page).to have_text('Forum (1 selected)')
        expect(page).to have_text('Topic (1 selected)')
        find('button.select-posts-button').click
        expect(page).to have_selector('div.selected-forum-post-card', count: 1)
      end

      scenario 'I can save my post packs submission' do
        topic = create(:forum_topic, course: course)
        forum_post = create(:course_discussion_post, topic: topic.acting_as, creator: user)
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button('Select Forum Post')
        find('div.forum-card').click
        find('div.topic-card').click
        find('div.forum-post-option').click
        find('button.select-posts-button').click
        wait_for_autosave

        expect(submission.current_answers.first.specific.reload.post_packs.count).to eq(1)
        expect(submission.current_answers.first.specific.reload.post_packs[0].post_id).to eq(forum_post.id)
      end

      scenario 'I cannot update my post packs after finalising' do
        topic = create(:forum_topic, course: course)
        create(:course_discussion_post, topic: topic.acting_as, creator: user)
        visit edit_course_assessment_submission_path(course, assessment, submission)

        click_button('Select Forum Post')
        find('div.forum-card').click
        find('div.topic-card').click
        find('div.forum-post-option').click
        find('button.select-posts-button').click
        click_button('Finalise Submission')
        accept_confirm_dialog do
          wait_for_job
        end
        expect(page).not_to have_button('Select Forum Post')
      end
    end
  end
end
