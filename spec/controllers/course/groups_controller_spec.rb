require 'rails_helper'

RSpec.describe Course::GroupsController, type: :controller do
  before do
    ActsAsTenant.current_tenant = Instance.default
    sign_in(create(:administrator))
  end

  def expect_response_with_flash(redirect_url, flash_type, message)
    expect(response).to redirect_to(redirect_url)
    expect(flash[flash_type]).to match(message)
  end

  def expect_response_with_notice(redirect_url, notice)
    expect_response_with_flash(redirect_url, :notice, notice)
  end

  def expect_response_with_error(redirect_url, notice)
    expect_response_with_flash(redirect_url, :error, notice)
  end

  let!(:course_student) { create(:course_user) }
  let!(:course) { course_student.course }
  let!(:course_owner) { create(:course_user, course: course, role: :owner) }
  let!(:empty_group) { create(:course_group, course: course) }
  let!(:not_enrolled) { create(:course_user) }

  describe '#index' do
    it 'renders course/groups/index template' do
      get :index, course_id: course.id
      expect(response).to render_template(:index)
    end
  end

  describe '#new' do
    it 'renders course/groups/new template' do
      get :new, course_id: course.id
      expect(response).to render_template(:new)
    end
  end

  describe '#create' do
    subject do
      post :create,
           course_id: course.id,
           course_group: @course_group.as_json,
           user_ids: @user_ids,
           user_emails: @user_emails
    end

    before do
      @course_group = build(:course_group, course: course)
      @user_ids = []
      @user_emails = { course_student.user.id => course_student.user.email }
    end

    context 'creating an empty group' do
      it 'only creates a group' do
        expect { subject }.to change(Course::Group, :count).by(1).
          and change(Course::GroupUser, :count).by(0)
        expect_response_with_notice(
          edit_course_group_path(course, Course::Group.all.last),
          I18n.t('course.groups.create.notice', raise: true)
        )
      end
    end

    context 'creating a group and add users to the group' do
      before do
        @user_ids = [course_student.user.id]
      end

      it 'creates a group and a group user' do
        expect { subject }.to change(Course::Group, :count).by(1).
          and change(Course::GroupUser, :count).by(1)
        expect_response_with_notice(
          edit_course_group_path(course, Course::Group.all.last),
          I18n.t('course.groups.create.notice', raise: true)
        )
      end
    end

    context 'creating a group with a blank name' do
      before do
        @course_group.name = ''
        @course_group.valid?
      end

      it 'does not create a group and redirect back to new group page' do
        expect { subject }.to change(Course::Group, :count).by(0).
          and change(Course::GroupUser, :count).by(0)
        expect_response_with_error(
          new_course_group_path(course),
          I18n.t('course.groups.create.error_format',
                 reason: @course_group.errors.full_messages.first)
        )
      end
    end

    context 'creating a group and adding nonexisting user' do
      before do
        @non_exist_user_id = (User.all.last.id + 1).to_s
        @non_exist_email = 'nonexistinguser@example.com'
        @user_ids = [@non_exist_user_id]
        @user_emails = { @non_exist_user_id => @non_exist_email }
      end

      it 'does not add the user to the group' do
        expect { subject }.not_to change(Course::GroupUser, :count)
        expect_response_with_error(
          edit_course_group_path(course, Course::Group.last),
          I18n.t('course.groups.create.error_format',
                 reason: 'User ' + I18n.t('course.groups.create.user_not_found_format',
                                          email: @non_exist_email,
                                          raise: true))
        )
      end
    end

    context 'creating a group and adding not enrolled user' do
      before do
        @user_ids = [not_enrolled.user.id.to_s]
        @user_emails = { @user_ids.first => not_enrolled.user.email }
      end

      it 'does not add the user to the group' do
        expect { subject }.not_to change(Course::GroupUser, :count)
        expect_response_with_error(
          edit_course_group_path(course, Course::Group.last),
          I18n.t('course.groups.create.error_format',
                 reason: 'User ' + I18n.t('course.groups.create.user_not_enrolled_format',
                                          email: not_enrolled.user.email,
                                          raise: true))
        )
      end
    end
  end

  describe '#edit' do
    it 'renders course/group/edit template' do
      get :edit, course_id: course, id: empty_group.id
      expect(response).to render_template(:edit)
      expect(assigns(:in_group)).to contain_exactly
      expect(assigns(:not_in_group)).to contain_exactly(course_student, course_owner)
    end
  end

  describe '#update' do
    subject do
      put :update,
          course_id: course.id,
          id: empty_group.id,
          course_group: @course_group.as_json,
          user_ids: @user_ids,
          user_emails: @user_emails
      empty_group.reload
      course_owner.user.reload
      course_student.user.reload
    end

    before do
      @course_group = build(:course_group, course: course, name: empty_group.name + ' updated')
      @user_ids = []
      @user_emails = {
        course_owner.user.id => course_owner.user.email,
        course_student.user.id => course_student.user.email
      }
    end

    context 'update with valid name and users' do
      let(:new_group_users) { course_student.user.group_users + course_owner.user.group_users }
      before do
        @user_ids = [course_owner.user.id, course_student.user.id]
      end

      it 'updates the group name and adds group users' do
        expect { subject }.to change(empty_group, :name).to(empty_group.name + ' updated')
        expect(empty_group.group_users).to contain_exactly(*new_group_users)
      end
    end

    context 'update with blank name' do
      before do
        @course_group.name = ''
      end

      it 'does not change the group' do
        expect { subject }.not_to change(empty_group, :name)
        expect_response_with_error(
          edit_course_group_path(course, empty_group),
          I18n.t('course.groups.update.error_format',
                 reason: @course_group.errors.full_messages.first,
                 raise: true)
        )
      end
    end

    context 'adding nonexisting user' do
      before do
        @non_exist_user_id = (User.all.last.id + 1).to_s
        @non_exist_email = 'nonexistinguser@example.com'
        @user_ids = [@non_exist_user_id]
        @user_emails = { @non_exist_user_id => @non_exist_email }
      end

      it 'does not add the user to the group' do
        expect { subject }.not_to change(Course::GroupUser, :count)
        expect_response_with_error(
          edit_course_group_path(course, empty_group),
          I18n.t('course.groups.update.error_format',
                 reason: 'User ' + I18n.t('course.groups.update.user_not_found_format',
                                          email: @non_exist_email,
                                          raise: true))
        )
      end
    end

    context 'adding not enrolled user' do
      before do
        @user_ids = [not_enrolled.user.id.to_s]
        @user_emails = { @user_ids.first => not_enrolled.user.email }
      end

      it 'does not add the user to the group' do
        expect { subject }.not_to change(Course::GroupUser, :count)
        expect_response_with_error(
          edit_course_group_path(course, empty_group),
          I18n.t('course.groups.update.error_format',
                 reason: 'User ' + I18n.t('course.groups.update.user_not_enrolled_format',
                                          email: not_enrolled.user.email,
                                          raise: true))
        )
      end
    end
  end

  describe '#destroy' do
    it 'destroys the group user' do
      expect { delete :destroy, course_id: course.id, id: empty_group.id }.
        to change(Course::Group, :count).by(-1)
    end
  end
end
