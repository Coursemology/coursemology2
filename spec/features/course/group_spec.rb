require 'rails_helper'

RSpec.describe 'Group', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  def t(action, key)
    I18n.t("course.groups.#{action}.#{key}", raise: true)
  end

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }
    let!(:course_student) { create(:course_user, course: course) }
    let!(:course_owner) { create(:course_user, course: course, user: user) }
    let!(:empty_group) { create(:course_group, course: course, name: 'Empty Group') }

    before do
      login_as(user, scope: :user)
    end

    describe 'index' do
      before do
        visit course_groups_path(course)
      end

      it { should have_text(empty_group.name) }
      it { should have_link(t('index', 'edit'), href: edit_course_group_path(course, empty_group)) }
      it { should have_link(t('index', 'delete'), href: course_group_path(course, empty_group)) }
    end

    describe 'edit' do
      before do
        visit edit_course_group_path(course, empty_group)
      end

      it { should have_field('course_group[name]', with: empty_group.name) }
      it { should have_field('user_ids[]', with: course_student.user.id, checked: false) }
      it { should have_field('user_ids[]', with: course_owner.user.id, checked: false) }

      describe 'change name and add students' do
        before do
          fill_in 'course_group[name]', with: 'New Group Name'
          check 'user_ids[]', option: course_owner.user.id
          check 'user_ids[]', option: course_student.user.id
          click_button 'Update'
        end

        it { should have_field('course_group[name]', with: 'New Group Name') }
        it { should have_field('user_ids[]', with: course_student.user.id, checked: true) }
        it { should have_field('user_ids[]', with: course_owner.user.id, checked: true) }
      end

      describe 'delete the group' do
        before do
          click_link 'Delete Group'
        end

        it { should have_text(t('index', 'groups')) }
        it { should have_link(t('index', 'new_group'), href: new_course_group_path(course)) }
      end
    end
  end
end
