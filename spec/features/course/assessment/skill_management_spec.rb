# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Skills' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager', js: true do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a skill' do
        visit course_assessments_skills_path(course)
        find('button.new-skill-button').click

        skill_attributes = attributes_for(:course_assessment_skill)
        fill_in 'title', with: skill_attributes[:title]

        find('.btn-submit').click

        find('.skill_branch#skill_branch_-1').click
        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_text(skill_attributes[:title])

        expect(course.assessment_skills.first.title).to eq(skill_attributes[:title])
      end

      scenario 'I can edit a skill' do
        skill = create(:course_assessment_skill, course: course)
        skill_branch = create(:course_assessment_skill_branch, course: course)
        visit course_assessments_skills_path(course)
        find('.skill_branch#skill_branch_-1').click
        find(content_tag_selector(skill)).click
        find("button.skill-edit-#{skill.id}").click

        new_skill_title = "#{skill.title} there!"
        fill_in 'title', with: new_skill_title
        # Does not work because it is not visible
        find('#select').click
        find("#select-#{skill_branch.id}").click

        find('.btn-submit').click

        find(".skill_branch#skill_branch_#{skill_branch.id}").click
        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_text(new_skill_title)

        expect(skill.reload.title).to eq(new_skill_title)
        expect(skill.skill_branch).to eq(skill_branch)
      end

      # Flaky test
      xscenario 'I can delete a skill' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessments_skills_path(course)
        find('.skill_branch#skill_branch_-1').click
        find(content_tag_selector(skill)).click
        sleep 0.2
        expect do
          find("button.skill-delete-#{skill.id}").click
          accept_confirm_dialog
        end.to change { course.assessment_skills.count }.by(-1)

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_no_content_tag_for(skill)
      end
    end
  end
end
