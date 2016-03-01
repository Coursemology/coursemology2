# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Post: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    let(:topic) { create(:forum_topic, forum: forum) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:administrator) }
      scenario 'I can see posts' do
        posts = create_list(:course_discussion_post, 2, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)
        posts.each do |post|
          expect(page).to have_content_tag_for(post)
        end
      end

      scenario 'I can create a post' do
        visit course_forum_topic_path(course, forum, topic)

        # Create a post with a missing title.
        within '#new_discussion_post' do
          fill_in 'discussion_post_title', with: nil
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
        expect(topic.reload.posts.last.title).to \
          eq(I18n.t('activerecord.attributes.course/discussion/post.title_reply_template',
                    title: topic.title))
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
        fill_in 'discussion_post_title', with: nil
        click_button 'submit'
        expect(current_path).to eq(course_forum_topic_post_path(course, forum, topic,
                                                                topic.posts.last))
        expect(page).to have_selector('div.alert.alert-danger')

        # Edit with valid information.
        fill_in 'discussion_post_title', with: 'new_title'
        fill_in 'discussion_post_text', with: 'new_text'
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(topic.reload.posts.last.title).to eq('new_title')
        expect(topic.reload.posts.last.text).to eq('new_text')
      end

      scenario 'I can delete a topic' do
        post = create(:course_discussion_post, topic: topic.acting_as)
        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: course_forum_topic_post_path(course, forum, topic, post)).click
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))

        expect(page).not_to have_content_tag_for(post)
      end

      scenario 'I can reply to a post' do
        create_list(:course_discussion_post, 2, topic: topic.topic)
        post = topic.posts.reload.sample

        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: reply_course_forum_topic_post_path(course, forum, topic, post)).click
        expect(current_path).to eq(reply_course_forum_topic_post_path(course, forum, topic, post))

        # Reply a post with a missing title.
        within '#new_discussion_post' do
          fill_in 'discussion_post_title', with: nil
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
        expect(topic.reload.posts.last.title).to \
          eq(I18n.t('activerecord.attributes.course/discussion/post.title_reply_template',
                    title: post.title))
        expect(topic.reload.posts.last.text).to eq('test')
        expect(topic.reload.posts.last.parent).to eq(post)
      end

      scenario 'I can reply to a topic' do
        create_list(:course_discussion_post, 2, topic: topic.topic)
        parent_post = topic.posts.reload.ordered_topologically.last
        expect(parent_post).not_to be_nil
        visit course_forum_topic_path(course, forum, topic)

        post_content = 'test post content'
        fill_in 'text', with: post_content
        click_button 'submit'

        new_post = topic.posts.reload.last
        expect(new_post.text).to eq(post_content)
        expect(new_post.parent).to eq(parent_post)
        expect(page).to have_content_tag_for(new_post)
      end
    end
  end
end
