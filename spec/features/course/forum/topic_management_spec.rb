require 'rails_helper'

RSpec.feature 'Course: Forum: Topic: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { course.creator }
      scenario 'I can see topics' do
        topics = create_list(:forum_topic, 2, forum: forum)
        visit course_forum_path(course, forum)
        topics.each do |topic|
          expect(page).to have_link(topic.title,
                                    href: course_forum_topic_path(course, forum, topic))
          expect(page).to have_content_tag_for(topic)
        end
      end

      scenario 'I can create a new topic with all types' do
        topic = build_stubbed(:forum_topic, forum: forum)

        visit course_forum_path(course, forum)
        find_link(nil, href: new_course_forum_topic_path(course, forum)).click

        expect(current_path).to eq(new_course_forum_topic_path(course, forum))

        # Create a topic with a missing title.
        click_button 'submit'

        expect(current_path).to eq(course_forum_topics_path(course, forum))
        expect(page).to have_selector('div.alert.alert-danger')

        # Create an announcement topic with a title.
        fill_in 'title', with: topic.title
        fill_in 'text', with: 'test'

        within '#topic_topic_type' do
          find("option[value='announcement']").select_option
        end
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, forum.topics.last))
        expect(forum.topics.last.topic_type).to eq('announcement')
        expect(forum.topics.last.posts.first.title).to eq(topic.title)
        expect(forum.topics.last.posts.first.text).to eq('test')

        # Create a sticky topic with a title.
        visit course_forum_path(course, forum)
        find_link(nil, href: new_course_forum_topic_path(course, forum)).click

        fill_in 'title', with: topic.title

        within '#topic_topic_type' do
          find("option[value='sticky']").select_option
        end
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, forum.topics.last))
        expect(forum.topics.last.topic_type).to eq('sticky')
      end

      scenario 'I can edit a topic' do
        topic = create(:forum_topic, forum: forum)

        # Edit with valid information.
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil, href: edit_course_forum_topic_path(course, forum, topic)).click

        new_title = 'new title'
        fill_in 'title', with: new_title
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic.reload))
        expect(page).to have_selector('h1', text: new_title)

        # Edit with invalid information.
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil, href: edit_course_forum_topic_path(course, forum, topic)).click

        fill_in 'title', with: ''
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic.reload))
        expect(page).to have_selector('div.alert.alert-danger')
      end

      scenario 'I can delete a topic' do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_topic_path(course, forum, topic)

        find_link(nil, href: course_forum_topic_path(course, forum, topic)).click
        expect(current_path).to eq(course_forum_path(course, forum))

        expect(page).not_to have_selector("#topic_#{topic.id}")
      end
    end
  end
end
