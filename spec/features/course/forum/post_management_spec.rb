# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Post: Management' do
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
          expect(page).to have_content_tag_for(post)
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        # Create a post with empty content.
        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: nil
          click_button 'submit'
        end

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_selector('div.alert.alert-danger')

        # Create a post with the default title.
        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: 'test'
          click_button 'submit'
        end

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(topic.reload.posts.last.text).to eq('test')
        expect(topic.reload.subscriptions.where(user: user).count).to eq(1)
      end

      scenario 'I can update a post' do
        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: edit_course_forum_topic_post_path(course, forum, topic,
                                                               topic.posts.last)).click
        expect(current_path).to eq(edit_course_forum_topic_post_path(course, forum, topic,
                                                                     topic.posts.last))

        # Edit with invalid information.
        fill_in 'discussion_post_text', with: nil
        click_button 'submit'
        expect(current_path).to eq(course_forum_topic_post_path(course, forum, topic,
                                                                topic.posts.last))
        expect(page).to have_selector('div.alert.alert-danger')

        # Edit with valid information.
        fill_in 'discussion_post_text', with: 'new_text'
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(topic.reload.posts.last.text).to eq('new_text')
      end

      scenario 'I can delete a post' do
        post = create(:course_discussion_post, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: course_forum_topic_post_path(course, forum, topic, post)).click
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))

        expect(page).to have_no_content_tag_for(post)
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: reply_course_forum_topic_post_path(course, forum, topic, post)).click
        expect(current_path).to eq(reply_course_forum_topic_post_path(course, forum, topic, post))

        # Reply a post with empty content.
        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: nil
          click_button 'submit'
        end

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_selector('div.alert.alert-danger')

        # Reply a post with the default title.
        find_link(nil, href: reply_course_forum_topic_post_path(course, forum, topic, post)).click

        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: 'test'
          click_button 'submit'
        end

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(topic.reload.posts.last.text).to eq('test')
        expect(topic.reload.posts.last.parent).to eq(post)
      end

      scenario 'I can reply to a topic' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        parent_post = topic.posts.reload.ordered_topologically.last
        expect(parent_post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        post_content = 'test post content'
        fill_in 'discussion_post_text', with: post_content
        click_button 'submit'

        new_post = topic.posts.reload.last
        expect(new_post.text).to eq(post_content)
        expect(page).to have_content_tag_for(new_post)
      end

      scenario 'I can vote for a post' do
        post = topic.posts.first
        expect(post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        # Downvote
        within find(content_tag_selector(post)) do
          find('a .fa-thumbs-o-down').find(:xpath, '..').click
        end
        expect(post.reload.vote_tally).to eq(-1)

        # Un-downvote
        within find(content_tag_selector(post)) do
          find('a .fa-thumbs-down').find(:xpath, '..').click
        end
        expect(post.reload.vote_tally).to eq(0)

        # Upvote
        within find(content_tag_selector(post)) do
          find('a .fa-thumbs-o-up').find(:xpath, '..').click
        end
        expect(post.reload.vote_tally).to eq(1)

        # Un-upvote
        within find(content_tag_selector(post)) do
          find('a .fa-thumbs-up').find(:xpath, '..').click
        end
        expect(post.reload.vote_tally).to eq(0)
      end

      scenario 'I can mark/unmark post as answer' do
        post = create(:course_discussion_post, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)

        # Mark as answer
        within find(content_tag_selector(post)) do
          find('a .fa-check').find(:xpath, '..').click
        end
        expect(post.reload).to be_answer
        expect(topic.reload).to be_resolved

        # Unmark as answer
        within find(content_tag_selector(post)) do
          find('a .fa-check-circle').find(:xpath, '..').click
        end
        expect(post.reload).not_to be_answer
        expect(topic.reload).not_to be_resolved
      end

      scenario 'I can see new posts' do
        visit course_forum_topic_path(course, forum, topic)
        expect(page).to have_selector(content_tag_selector(topic.posts.first, class: 'unread'))
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can see posts' do
        posts = create_list(:course_discussion_post, 2, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_content_tag_for(post)
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: 'test'
          click_button 'submit'
        end

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(topic.reload.posts.last.text).to eq('test')
        expect(topic.reload.subscriptions.where(user: user).count).to eq(1)
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: reply_course_forum_topic_post_path(course, forum, topic, post)).click

        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: 'test'
          click_button 'submit'
        end

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(topic.reload.posts.last.text).to eq('test')
        expect(topic.reload.posts.last.parent).to eq(post)
      end

      scenario 'I can reply to a topic' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        parent_post = topic.posts.reload.ordered_topologically.last
        expect(parent_post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        post_content = 'test post content'
        fill_in 'discussion_post_text', with: post_content
        click_button 'submit'

        new_post = topic.posts.reload.last
        expect(new_post.text).to eq(post_content)
        expect(page).to have_content_tag_for(new_post)
      end

      scenario 'I can vote for a post' do
        post = topic.posts.first
        expect(post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        within find(content_tag_selector(post)) do
          find('a .fa-thumbs-o-up').find(:xpath, '..').click
        end
        expect(post.reload.vote_tally).to eq(1)
      end

      scenario 'I can see new posts' do
        visit course_forum_topic_path(course, forum, topic)
        expect(page).to have_selector(content_tag_selector(topic.posts.first, class: 'unread'))
      end

      scenario 'I can see topics with unread posts' do
        create_list(:course_discussion_post, 2, topic: topic.acting_as)
        post = topic.posts.reload.sample

        reader = create(:course_user, course: course).user

        expect(topic.unread?(reader)).to be_falsy

        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: reply_course_forum_topic_post_path(course, forum, topic, post)).click

        within '#new_discussion_post' do
          fill_in 'discussion_post_text', with: 'test'
          click_button 'submit'
        end

        expect(topic.unread?(reader)).to be_truthy
      end
    end
  end
end
