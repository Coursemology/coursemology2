require 'rails_helper'

RSpec.describe 'System: Administration: Announcements', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }

    before do
      login_as(user, scope: :user)
    end

    describe 'announcement creation' do
      before { visit new_admin_announcement_path }

      context 'with invalid information' do
        before do
          click_button I18n.t('helpers.submit.announcement.create')
        end

        it 'stays on the same page' do
          expect(page).to have_button(I18n.t('helpers.submit.announcement.create'))
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:announcement) { build(:instance_announcement, instance: instance) }

        before do
          fill_in 'announcement[title]',      with: announcement.title
          fill_in 'announcement[content]',    with: announcement.content
          fill_in 'announcement[valid_from]', with: announcement.valid_from
          fill_in 'announcement[valid_to]',   with: announcement.valid_to
        end

        it 'creates an announcement' do
          expect { click_button I18n.t('helpers.submit.announcement.create') }.to change(
            Instance::Announcement, :count).by(1)
        end

        context 'after creation' do
          before { click_button I18n.t('helpers.submit.announcement.create') }

          it 'shows the success message' do
            expect(page).to have_selector('div',
                                          text: I18n.t('system.admin.announcements.create.success'))
          end

          it 'redirects the user to the index page' do
            expect(current_path).to eq(admin_announcements_path)
          end
        end
      end
    end

    describe 'announcement editing' do
      let!(:announcement) { create(:instance_announcement, instance: instance) }

      before { visit edit_admin_announcement_path(announcement) }

      context 'page rendering' do
        it { is_expected.to have_field('announcement[title]', with: announcement.title) }

        it do
          is_expected.to have_field('announcement[content]', with: announcement.content)
        end

        it do
          is_expected.to have_field('announcement[valid_from]',
                                    with: announcement.valid_from)
        end

        it do
          is_expected.to have_field('announcement[valid_to]', with: announcement.valid_to)
        end
      end

      context 'with invalid information' do
        before do
          fill_in 'announcement[title]', with: ''
          click_button I18n.t('helpers.submit.announcement.update')
        end

        it 'stays on the same page' do
          expect(page).to have_button(I18n.t('helpers.submit.announcement.update'))
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:new_title)  { 'New Title' }
        let(:new_content) { 'New content' }

        before do
          fill_in 'announcement[title]',        with: new_title
          fill_in 'announcement[content]',      with: new_content
          click_button I18n.t('helpers.submit.announcement.update')
        end

        it 'redirects the user to index page' do
          expect(current_path).to eq admin_announcements_path
        end

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.t('system.admin.announcements.update.success'))
        end

        it 'changes the attributes' do
          expect(announcement.reload.title).to eq(new_title)
          expect(announcement.reload.content).to eq(new_content)
        end
      end
    end

    describe 'index' do
      let!(:announcements) do
        create_list(:instance_announcement, 10, instance: instance, creator: user, updater: user)
      end

      before do
        visit admin_announcements_path
      end

      context 'management buttons' do
        it { is_expected.to have_link(nil, href: new_admin_announcement_path) }
      end

      it 'shows all announcements' do
        announcements.each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end

      it 'shows all management buttons' do
        announcements.each do |announcement|
          expect(page).to have_link(nil, href: edit_admin_announcement_path(announcement))
          expect(page).to have_link(nil, href: admin_announcement_path(announcement))
        end
      end
    end

    describe 'announcement deletion' do
      let!(:announcement) { create(:instance_announcement, instance: instance) }
      let(:announcement_path) { admin_announcement_path(announcement) }
      before { visit admin_announcements_path }

      it 'deletes the announcement' do
        find_link(nil, href: announcement_path).click
        it { is_expected.not_to have_link(nil, href: announcement_path) }
      end
    end
  end
end
