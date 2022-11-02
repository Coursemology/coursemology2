# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Post: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum, course: course, topic_type: :question) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can see posts' do
        posts = create_list(:course_discussion_post, 2, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        find('button.new-post-button').click

        # Create a post with empty content.
        find('button.btn-submit').click
        expect_toastify('Post cannot be empty!')

        # Create a post with the default title.
        expect do
          fill_in_react_ck 'textarea[name=postNewText]', 'test'
          find('button.btn-submit').click
          expect_toastify('The post has been created.')
        end.to change { topic.reload.posts.count }.by(1)

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.subscriptions.where(user: user).count).to eq(1)
        within find("div.post_#{topic.posts.last.id}") do
          expect(page).to have_selector('div.bg-red-100')
        end
      end

      scenario 'I can update my own post' do
        create(:course_discussion_post, topic: topic.acting_as, creator: user)
        topic.reload
        visit course_forum_topic_path(course, forum, topic)
        post = topic.posts.last

        # My own post
        find("button.post-edit-#{post.id}").click

        # Edit with invalid information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", ' '
        find('.save-button').click
        expect_toastify('Post cannot be empty!')

        # Edit with valid information.
        fill_in_react_ck "textarea[name=postEditText_#{post.id}]", 'new_text'
        find('.save-button').click
        expect_toastify('The post has been updated.')

        expect(topic.reload.posts.last.text).to eq('<p>new_text</p>')
        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('new_text')
        end
      end

      scenario 'I can delete my own post' do
        post = create(:course_discussion_post, topic: topic.acting_as, creator: user)
        visit course_forum_topic_path(course, forum, topic)

        expect do
          find("button.post-delete-#{post.id}").click
          accept_confirm_dialog
        end.to change { topic.posts.exists?(post.id) }.to(false)
        expect(page).to have_no_selector("div.post_#{post.id}")

        post = topic.reload.posts.first

        expect do
          find("button.post-delete-#{post.id}").click
          accept_confirm_dialog
        end.to change { topic.posts.exists?(post.id) }.to(false)
        expect(current_path).to eq(course_forum_path(course, forum))
        expect(page).to have_no_selector("tr.topic_#{topic.id}")
        expect(forum.topics.exists?(topic.id)).to eq(false)
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find("button.post-reply-#{post.id}").click

        # Reply a post with empty content.
        find('.reply-button').click
        expect_toastify('Post cannot be empty!')

        # Reply a post with the default title.
        fill_in_react_ck "textarea[name=postReplyText_#{post.id}]", 'test'
        find('.reply-button').click
        expect_toastify('The reply post has been created.')

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.posts.last.parent).to eq(post)

        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('test')
        end
      end

      scenario 'I can vote for a post' do
        post = topic.posts.first
        expect(post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        # Downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownOffAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(-1)
        expect(find('div.vote-tally').text).to eq('-1')

        # Un-downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')

        # Upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpOffAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(1)
        expect(find('div.vote-tally').text).to eq('1')

        # Un-upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')
      end

      scenario 'I can mark/unmark post as answer' do
        post = create(:course_discussion_post, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)

        # Mark as answer
        within find("div.post_#{post.id}") do
          find('svg[data-testId="CheckIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload).to be_answer
        expect(topic.reload).to be_resolved
        within find("div.post_#{post.id}") do
          expect(page).to have_selector('div.bg-green-100')
        end

        # Unmark as answer
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ClearIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload).not_to be_answer
        expect(topic.reload).not_to be_resolved
        within find("div.post_#{post.id}") do
          expect(page).to have_no_selector('div.bg-green-100')
        end
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can see posts' do
        posts = create_list(:course_discussion_post, 2, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_selector("div.post_#{post.id}")
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        find('button.new-post-button').click

        expect do
          fill_in_react_ck 'textarea[name=postNewText]', 'test'
          find('button.btn-submit').click
          expect_toastify('The post has been created.')
        end.to change { topic.reload.posts.count }.by(1)

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.subscriptions.where(user: user).count).to eq(1)
        within find("div.post_#{topic.posts.last.id}") do
          expect(page).to have_selector('div.bg-red-100')
          expect(page).to have_no_selector('svg[data-testId="CheckIcon"]')
        end
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find("button.post-reply-#{post.id}").click

        fill_in_react_ck "textarea[name=postReplyText_#{post.id}]", 'test'
        find('.reply-button').click
        expect_toastify('The reply post has been created.')

        expect(topic.reload.posts.last.text).to eq('<p>test</p>')
        expect(topic.reload.posts.last.parent).to eq(post)

        expect(page).to have_selector("div.post_#{topic.posts.last.id}")
        within find("div.post_#{topic.reload.posts.last.id}") do
          expect(page).to have_text('test')
        end
      end

      scenario 'I can vote for a post' do
        post = topic.posts.first
        expect(post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        # Downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownOffAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(-1)
        expect(find('div.vote-tally').text).to eq('-1')

        # Un-downvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbDownAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')

        # Upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpOffAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(1)
        expect(find('div.vote-tally').text).to eq('1')

        # Un-upvote
        within find("div.post_#{post.id}") do
          find('svg[data-testId="ThumbUpAltIcon"]').find(:xpath, '..').click
        end
        expect_toastify('The post has been updated.')
        expect(post.reload.vote_tally).to eq(0)
        expect(find('div.vote-tally').text).to eq('0')
      end

      scenario 'I can see topics with unread posts' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        reader = create(:course_user, course: course).user

        expect(topic.unread?(reader)).to be_falsy

        visit course_forum_topic_path(course, forum, topic)

        find("button.post-reply-#{post.id}").click

        fill_in_react_ck "textarea[name=postReplyText_#{post.id}]", 'test'
        find('.reply-button').click
        expect_toastify('The reply post has been created.')

        expect(topic.unread?(reader)).to be_truthy
      end
    end
  end
end
