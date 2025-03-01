# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: RagWise: Forum', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:original_course) { create(:course, :with_rag_wise_component_enabled) }
    let(:duplicated_course) do
      create(:duplication_traceable_course,
             source: original_course,
             course: create(:course, :with_rag_wise_component_enabled)).course
    end
    let(:forum1) { create(:forum, course: original_course) }
    let(:forum2) { create(:forum, course: original_course) }
    let(:topic1) { create(:forum_topic, forum: forum1, course: original_course) }
    let(:topic2) { create(:forum_topic, forum: forum2, course: original_course) }

    before do
      login_as(original_user, scope: :user, redirect_url: course_admin_rag_wise_path(duplicated_course))
      vector = JSON.parse(File.read(File.join(Rails.root, '/spec/features/rag_wise/vector.json')))['vector']
      allow_any_instance_of(Langchain::LLM::OpenAI).to receive(:embed).and_return(double(embedding: vector))
    end

    context 'As a Course Manager of duplicated course and parent course' do
      let(:user) { create(:course_manager, course: duplicated_course).user }
      let(:original_user) { create(:course_manager, user: user, course: original_course).user }

      scenario 'I can add and remove forum from knowledge base (singular)' do
        create_list(:course_discussion_post, 5, :published,
                    topic: topic1.acting_as, is_ai_generated: true, parent: topic1.posts.first)

        find('label', text: 'Expand all courses').click
        forum1_switch = find('.MuiListItemText-root span', text: /^forum/).ancestor('li').find('.MuiSwitch-root')
        forum1_switch.click
        wait_for_page
        expect_toastify("#{forum1.name} has been added to knowledge base.", dismiss: true)
        expect(duplicated_course.reload.forum_imports.first.workflow_state).to eq('imported')
        forum1_switch.click
        wait_for_page
        expect_toastify("#{forum1.name} has been removed from knowledge base.", dismiss: true)
        expect(duplicated_course.reload.forum_imports.first.workflow_state).to eq('not_imported')
      end

      scenario 'I can add and remove forums from knowledge base (plural)' do
        create_list(:course_discussion_post, 2, :published,
                    topic: topic1.acting_as, is_ai_generated: true, parent: topic1.posts.first)
        create_list(:course_discussion_post, 3, :published,
                    topic: topic2.acting_as, is_ai_generated: true, parent: topic2.posts.first)

        visit course_admin_rag_wise_path(duplicated_course)

        find('label', text: 'Expand all courses').click
        course_switch = find('.MuiListItemText-root span',
                             text: /^Course/).ancestor('div.items-center').find('.MuiSwitch-root')
        course_switch.click
        wait_for_page
        expect(duplicated_course.reload.forum_imports[0].workflow_state).to eq('imported')
        expect(duplicated_course.reload.forum_imports[1].workflow_state).to eq('imported')
        course_switch.click
        wait_for_page
        expect(duplicated_course.reload.forum_imports[0].workflow_state).to eq('not_imported')
        expect(duplicated_course.reload.forum_imports[1].workflow_state).to eq('not_imported')
      end
    end

    context 'As a Course Manager of duplicated course but not Course Manager of parent course' do
      let(:original_user) { create(:course_manager, course: duplicated_course).user }

      scenario 'I cannot add and remove forum from knowledge base' do
        create_list(:course_discussion_post, 2, :published,
                    topic: topic1.acting_as, is_ai_generated: true, parent: topic1.posts.first)

        find('label', text: 'Expand all courses').click
        forum_switch = find('.MuiListItemText-root span', text: /^forum/).ancestor('li').find('.MuiSwitch-root')
        course_switch = find('.MuiListItemText-root span',
                             text: /^Course/).ancestor('div.items-center').find('.MuiSwitch-root')
        expect(forum_switch).to have_css('.Mui-disabled')
        expect(course_switch).to have_css('.Mui-disabled')
      end
    end
  end
end
