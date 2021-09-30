# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Skill Branches' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a skill branch' do
        visit course_assessments_skills_path(course)
        click_link(nil, href: new_course_assessments_skill_branch_path(course))

        skill_branch_attributes = attributes_for(:course_assessment_skill_branch)
        fill_in 'title', with: skill_branch_attributes[:title]
        fill_in 'description', with: skill_branch_attributes[:description]

        click_button 'submit'

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_content_tag_for(course.assessment_skill_branches.first)

        expect(course.assessment_skill_branches.first.title).to \
          eq(skill_branch_attributes[:title])
        expect(course.assessment_skill_branches.first.description).to \
          eq(skill_branch_attributes[:description])
      end

      scenario 'I can edit a skill branch' do
        skill_branch = create(:course_assessment_skill_branch, course: course)
        visit course_assessments_skills_path(course)
        within find(content_tag_selector(skill_branch)) do
          click_link(nil, href: edit_course_assessments_skill_branch_path(course, skill_branch))
        end

        new_skill_branch_title = "#{skill_branch.title} there!"
        fill_in 'title', with: new_skill_branch_title

        click_button 'submit'

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_content_tag_for(skill_branch)

        expect(skill_branch.reload.title).to eq(new_skill_branch_title)
      end

      scenario 'I can delete a skill branch' do
        skill_branch = create(:course_assessment_skill_branch, course: course)
        visit course_assessments_skills_path(course)
        within find(content_tag_selector(skill_branch)) do
          click_link(nil, href: course_assessments_skill_branch_path(course, skill_branch))
        end

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_no_content_tag_for(skill_branch)
      end
    end
  end
end
