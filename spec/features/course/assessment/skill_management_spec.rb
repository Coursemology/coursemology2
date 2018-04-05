# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course: Skills' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can create a skill' do
        visit course_assessments_skills_path(course)
        click_link(nil, href: new_course_assessments_skill_path(course))

        skill_attributes = attributes_for(:course_assessment_skill)
        fill_in 'title', with: skill_attributes[:title]
        fill_in 'description', with: skill_attributes[:description]

        click_button 'submit'

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_content_tag_for(course.assessment_skills.first)

        expect(course.assessment_skills.first.title).to eq(skill_attributes[:title])
        expect(course.assessment_skills.first.description).to eq(skill_attributes[:description])
      end

      scenario 'I can edit a skill' do
        skill = create(:course_assessment_skill, course: course)
        skill_branch = create(:course_assessment_skill_branch, course: course)
        visit course_assessments_skills_path(course)
        within find(content_tag_selector(skill)) do
          click_link(nil, href: edit_course_assessments_skill_path(course, skill))
        end

        new_skill_title = skill.title + ' there!'
        fill_in 'title', with: new_skill_title
        select skill_branch.title

        click_button 'submit'

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_content_tag_for(skill)

        expect(skill.reload.title).to eq(new_skill_title)
        expect(skill.skill_branch).to eq(skill_branch)
      end

      scenario 'I can delete a skill' do
        skill = create(:course_assessment_skill, course: course)
        visit course_assessments_skills_path(course)
        within find(content_tag_selector(skill)) do
          click_link(nil, href: course_assessments_skill_path(course, skill))
        end

        expect(current_path).to eq(course_assessments_skills_path(course))
        expect(page).to have_no_content_tag_for(skill)
      end
    end
  end
end
