# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Skill Branches' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager', js: true do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a skill branch' do
        visit course_assessments_skills_path(course)
        find('button.new-skill-branch-button').click

        skill_branch_attributes = attributes_for(:course_assessment_skill_branch)
        fill_in 'title', with: skill_branch_attributes[:title]

        find('.btn-submit').click

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_text(skill_branch_attributes[:title])

        expect(course.assessment_skill_branches.first.title).to \
          eq(skill_branch_attributes[:title])
      end

      scenario 'I can edit a skill branch' do
        skill_branch = create(:course_assessment_skill_branch, course: course)
        visit course_assessments_skills_path(course)
        find(content_tag_selector(skill_branch)).click
        find("button.skill-branch-edit-#{skill_branch.id}").click

        new_skill_branch_title = "#{skill_branch.title} there!"
        fill_in 'title', with: new_skill_branch_title

        find('.btn-submit').click

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_text(new_skill_branch_title)

        expect(skill_branch.reload.title).to eq(new_skill_branch_title)
      end

      scenario 'I can delete a skill branch' do
        skill_branch = create(:course_assessment_skill_branch, course: course)
        visit course_assessments_skills_path(course)
        find(content_tag_selector(skill_branch)).click

        expect do
          find("button.skill-branch-delete-#{skill_branch.id}").click
          accept_confirm_dialog
        end.to change { course.assessment_skill_branches.count }.by(-1)

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_no_content_tag_for(skill_branch)
      end
    end
  end
end
