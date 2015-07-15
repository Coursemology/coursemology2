require 'rails_helper'

RSpec.feature 'Course: Assessments: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { course.creator }
      scenario 'I can create a new assessment' do
        assessment = build_stubbed(:assessment)

        visit course_assessments_path(course)
        find_link(nil, href: new_course_assessment_path(course)).click

        expect(current_path).to eq(new_course_assessment_path(course))

        # Create an assessment with a missing title.
        fill_in 'assessment_description', with: assessment.description
        fill_in 'assessment_base_exp', with: assessment.base_exp
        fill_in 'assessment_time_bonus_exp', with: assessment.time_bonus_exp
        fill_in 'assessment_extra_bonus_exp', with: assessment.extra_bonus_exp
        fill_in 'assessment_start_time', with: assessment.start_time
        fill_in 'assessment_end_time', with: assessment.end_time
        fill_in 'assessment_bonus_end_time', with: assessment.bonus_end_time

        click_button 'submit'

        expect(current_path).to eq(course_assessments_path(course))
        expect(page).to have_selector('div.alert.alert-danger')
        expect(page).to have_field('assessment_base_exp', with: assessment.base_exp)

        fill_in 'assessment_title', with: assessment.title
        click_button 'submit'

        expect(page).to have_selector('h1', text: assessment.title)
        assessment_exp = assessment.base_exp + assessment.time_bonus_exp +
                         assessment.extra_bonus_exp
        expect(page).to have_selector('tr.maximum_experience_points td', text: assessment_exp)
      end

      scenario 'I can edit an assessment' do
        assessment = create(:assessment, course: course)
        visit course_assessment_path(course, assessment)
        find_link(nil, href: edit_course_assessment_path(course, assessment)).click

        new_text = 'zzzz'
        fill_in 'assessment_title', with: new_text
        click_button 'submit'

        expect(current_path).to eq(course_assessment_path(course, assessment))
        expect(page).to have_selector('h1', text: new_text)
      end

      scenario 'I can delete an assessment' do
        assessment = create(:assessment, course: course)
        visit course_assessment_path(course, assessment)

        find(:css, 'div.page-header a.btn-danger').click
        expect(current_path).to eq(course_assessments_path(course))

        expect(page).not_to have_selector("#assessment_#{assessment.id}")
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_user, :approved, course: course).user }
      scenario 'I can see assessments' do
        assessment = create(:assessment, course: course)
        visit course_assessments_path(course)

        find_link(assessment.title, href: course_assessment_path(course, assessment)).click
        expect(current_path).to eq(course_assessment_path(course, assessment))
      end
    end
  end
end
