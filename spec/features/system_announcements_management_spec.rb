require 'rails_helper'

RSpec.describe 'System announcements', type: :feature do
  let!(:user) { create(:user, role: :administrator) }

  before do
    login_as(user, scope: :user)
  end

  describe 'announcement creation' do
    before { visit new_admin_system_announcement_path }
    subject { click_button I18n.t('helpers.submit.system_announcement.create') }

    context 'with invalid information' do
      before { subject }

      it 'stays on the same page' do
        expect(page).to have_button(I18n.t('helpers.submit.system_announcement.create'))
      end

      it 'shows errors' do
        expect(page).to have_css('div.has-error')
      end
    end

    context 'with valid information' do
      let(:announcement) { build(:system_announcement) }

      before do
        fill_in 'system_announcement[title]',      with: announcement.title
        fill_in 'system_announcement[content]',    with: announcement.content
        fill_in 'system_announcement[valid_from]', with: announcement.valid_from
        fill_in 'system_announcement[valid_to]',   with: announcement.valid_to
      end

      it 'creates an announcement' do
        expect { subject }.to change(SystemAnnouncement, :count).by(1)
      end

      context 'after creation' do
        before { subject }

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.t('admin.system_announcements.create.success'))
        end

        it 'redirects the user to the index page' do
          expect(current_path).to eq(admin_system_announcements_path)
        end
      end
    end
  end

  describe 'announcement editing' do
    let!(:announcement) { create(:system_announcement) }

    before { visit edit_admin_system_announcement_path(announcement) }
    subject { click_button I18n.t('helpers.submit.system_announcement.update') }

    context 'with invalid information' do
      before do
        fill_in 'system_announcement[title]', with: ''
        subject
      end

      it 'stays on the same page' do
        expect(page).to have_button('helpers.submit.system_announcement.update')
      end

      it 'shows errors' do
        expect(page).to have_css('div.has-error')
      end
    end

    context 'with valid information' do
      let(:new_title)  { 'New Title' }
      let(:new_content) { 'New content' }

      before do
        fill_in 'system_announcement[title]',        with: new_title
        fill_in 'system_announcement[content]',      with: new_content
        subject
      end

      it 'redirects the user to index page' do
        expect(current_path).to eq admin_system_announcements_path
      end

      it 'shows the success message' do
        expect(page).to have_selector('div', 'admin.system_announcements.update.success')
      end

      it 'changes the attributes' do
        expect(announcement.reload.title).to eq(new_title)
        expect(announcement.reload.content).to eq(new_content)
      end
    end
  end

  describe 'index' do
    let!(:announcements) { create_list(:system_announcement, 10, creator: user, updater: user) }

    before { visit admin_system_announcements_path }
    subject { page }

    context 'management buttons' do
      it { is_expected.to have_link(I18n.t('admin.system_announcements.index.new')) }
    end

    it 'shows all announcements' do
      announcements.each do |announcement|
        expect(subject).to have_selector('div', text: announcement.title)
        expect(subject).to have_selector('div', text: announcement.content)
      end
    end

    it 'shows all management buttons' do
      announcements.each do |announcement|
        expect(subject).to have_link(nil, href: edit_admin_system_announcement_path(announcement))
        expect(subject).to have_link(nil, href: admin_system_announcement_path(announcement))
      end
    end
  end

  describe 'announcement deletion' do
    let!(:announcement) { create(:system_announcement) }
    before { visit admin_system_announcements_path }
    subject { first('div.announcement a.btn-danger').click }

    it 'deletes the announcement' do
      expect { subject }.to change(SystemAnnouncement, :count).by(-1)
    end
  end
end
