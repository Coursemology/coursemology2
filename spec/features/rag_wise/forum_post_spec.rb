# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: RagWise: Forum: Post', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_rag_wise_component_enabled) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum, course: course) }
    let(:question_topic) { create(:forum_topic, forum: forum, course: course, topic_type: :question) }
    before do
      login_as(user, scope: :user)
      allow_any_instance_of(Course::Forum::PostsController).to receive(:auto_answer_action)
    end

    context 'As a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      scenario 'I can see AI generated drafted posts and press its publish button' do
        posts = create_list(:course_discussion_post, 2, :draft,
                            topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiButtonBase-root', text: 'Publish')

          publish_button = actual_post.find('div.MuiButtonBase-root', text: 'Publish')
          publish_button.click
          expect_toastify('The post has succesfully been published.', dismiss: true)
          expect(post.reload.workflow_state).to eq('published')
        end
      end

      scenario 'I can see AI generated drafted posts and press its mark as answer button and publish button' do
        posts = create_list(:course_discussion_post, 2, :draft,
                            topic: question_topic.acting_as,
                            is_ai_generated: true, parent: question_topic.posts.first)
        visit course_forum_topic_path(course, forum, question_topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Mark as answer and publish')

          publish_button = actual_post.find('div.MuiChip-root', text: 'Mark as answer and publish')
          publish_button.click
          wait_for_page
          expect(post.reload.answer).to eq(true)
          expect(post.reload.workflow_state).to eq('published')
        end
      end

      scenario 'I can see generate reply button only on post without parent' do
        parent_posts = create_list(:course_discussion_post, 2,
                                   topic: topic.acting_as)
        child_posts = create_list(:course_discussion_post, 2,
                                  topic: topic.acting_as, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        parent_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
        end

        child_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to_not have_selector('div.MuiChip-root', text: 'Generate reply')
        end
      end

      scenario 'I can click on generate reply button' do
        topic_post = topic.posts.first
        visit course_forum_topic_path(course, forum, topic)

        generate_reply_button = find("div.post_#{topic_post.id}").find('div.MuiChip-root', text: 'Generate reply')

        expect_any_instance_of(Course::Forum::PostsController).to receive(:auto_answer_action).with(true).once
        generate_reply_button.click
        wait_for_page
      end

      scenario 'I can update AI generated draft post (normal)' do
        create_list(:course_discussion_post, 1, :draft,
                    topic: topic.acting_as,
                    is_ai_generated: true, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        post = topic.reload.posts.last

        # My own post
        find("button.post-edit-#{post.id}").click

        # Edit with new information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", 'new_text'
        find('div.MuiChip-root', text: 'Publish').click
        expect_toastify('The post has succesfully been published.', dismiss: true)

        expect(topic.reload.posts.last.text).to eq('<p>new_text</p>')
        expect(topic.reload.posts.last.workflow_state).to eq('published')
        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('new_text')
        end
      end

      scenario 'I can update AI generated draft post (question topic)' do
        create_list(:course_discussion_post, 1, :draft,
                    topic: question_topic.acting_as,
                    is_ai_generated: true, parent: question_topic.posts.first)
        visit course_forum_topic_path(course, forum, question_topic)
        post = question_topic.reload.posts.last

        # My own post
        find("button.post-edit-#{post.id}").click

        # Edit with new information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", 'new_text'
        find('div.MuiChip-root', text: 'Mark as answer and publish').click
        wait_for_page

        expect(question_topic.reload.posts.last.text).to eq('<p>new_text</p>')
        expect(question_topic.reload.posts.last.workflow_state).to eq('published')
        expect(page).to have_selector("div.post_#{question_topic.posts.last.id}")
        within find("div.post_#{question_topic.reload.posts.last.id}") do
          expect(page).to have_text('new_text')
        end
      end
    end

    context 'As a teaching staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      scenario 'I can see AI generated drafted posts and press its publish button' do
        posts = create_list(:course_discussion_post, 2, :draft,
                            topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiButtonBase-root', text: 'Publish')

          publish_button = actual_post.find('div.MuiButtonBase-root', text: 'Publish')
          publish_button.click
          expect_toastify('The post has succesfully been published.', dismiss: true)
          expect(post.reload.workflow_state).to eq('published')
        end
      end

      scenario 'I can see AI generated drafted posts and press its mark as answer button and publish button' do
        posts = create_list(:course_discussion_post, 2, :draft,
                            topic: question_topic.acting_as,
                            is_ai_generated: true, parent: question_topic.posts.first)
        visit course_forum_topic_path(course, forum, question_topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Mark as answer and publish')

          publish_button = actual_post.find('div.MuiChip-root', text: 'Mark as answer and publish')
          publish_button.click
          wait_for_page
          expect(post.reload.answer).to eq(true)
          expect(post.reload.workflow_state).to eq('published')
        end
      end

      scenario 'I can see generate reply button only on post without parent' do
        parent_posts = create_list(:course_discussion_post, 2,
                                   topic: topic.acting_as)
        child_posts = create_list(:course_discussion_post, 2,
                                  topic: topic.acting_as, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        parent_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to have_selector('div.MuiChip-root', text: 'Generate reply')
        end
        child_posts.each do |post|
          actual_post = find("div.post_#{post.id}")
          expect(actual_post).to_not have_selector('div.MuiChip-root', text: 'Generate reply')
        end
      end

      scenario 'I can click on generate reply button' do
        topic_post = topic.posts.first
        visit course_forum_topic_path(course, forum, topic)

        generate_reply_button = find("div.post_#{topic_post.id}").find('div.MuiChip-root', text: 'Generate reply')
        expect_any_instance_of(Course::Forum::PostsController).to receive(:auto_answer_action).with(true).once
        generate_reply_button.click
        wait_for_page
      end

      scenario 'I can update AI generated draft post (normal)' do
        create_list(:course_discussion_post, 1, :draft,
                    topic: topic.acting_as,
                    is_ai_generated: true, parent: topic.posts.first, creator: User.system)
        visit course_forum_topic_path(course, forum, topic)
        post = topic.reload.posts.last

        # My own post
        find("button.post-edit-#{post.id}").click

        # Edit with new information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", 'new_text'
        find('div.MuiChip-root', text: 'Publish').click
        expect_toastify('The post has succesfully been published.', dismiss: true)

        expect(topic.reload.posts.last.text).to eq('<p>new_text</p>')
        expect(topic.reload.posts.last.workflow_state).to eq('published')
        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('new_text')
        end
      end

      scenario 'I can update AI generated draft post (question topic)' do
        create_list(:course_discussion_post, 1, :draft,
                    topic: question_topic.acting_as,
                    is_ai_generated: true, parent: question_topic.posts.first, creator: User.system)
        visit course_forum_topic_path(course, forum, question_topic)
        post = question_topic.reload.posts.last

        # My own post
        find("button.post-edit-#{post.id}").click

        # Edit with new information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", 'new_text'
        find('div.MuiChip-root', text: 'Mark as answer and publish').click
        wait_for_page

        expect(question_topic.reload.posts.last.text).to eq('<p>new_text</p>')
        expect(question_topic.reload.posts.last.workflow_state).to eq('published')
        expect(page).to have_selector("div.post_#{question_topic.posts.last.id}")
        within find("div.post_#{question_topic.reload.posts.last.id}") do
          expect(page).to have_text('new_text')
        end
      end
    end

    context 'As a course student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      scenario 'I cannot see drafted AI Generated forum response' do
        posts = create_list(:course_discussion_post, 2, :draft,
                            topic: topic.acting_as, is_ai_generated: true, parent: topic.posts.first)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to_not have_selector("div.post_#{post.id}")
        end
      end

      scenario 'I cannot see generate new reply button' do
        visit course_forum_topic_path(course, forum, topic)
        topic_post = topic.posts.first
        expect(topic_post).to_not have_selector('div.MuiChip-root', text: 'Generate reply')
      end
    end
  end
end
