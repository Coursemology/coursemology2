require 'rails_helper'

RSpec.describe 'Instance management', type: :feature do
  subject { page }

  let!(:user) { create(:user, role: :administrator) }
  before { login_as(user, scope: :user) }

  describe 'new page' do
    before { visit new_admin_instance_path }

    it { is_expected.to have_field('instance_name') }
    it { is_expected.to have_field('instance_host') }
  end

  describe 'instance creation' do
    before { visit new_admin_instance_path }

    context 'with invalid information' do
      it 'does not create a instance' do
        expect { click_button 'Create' }.not_to change(Instance, :count)
      end
    end

    context 'with valid information' do
      before do
        fill_in 'instance_name', with: 'Lorem ipsum'
        fill_in 'instance_host', with: 'example.org'
      end

      it 'creates a instance' do
        expect { click_button 'Create' }.to change(Instance, :count).by(1)
      end
    end
  end

  describe 'instance editing' do
    let(:instance) { create(:instance) }

    before { visit edit_admin_instance_path(instance) }

    context 'with valid information' do
      let(:new_name) { 'New Name' }
      let(:new_host) { 'coursemology.org' }

      before do
        fill_in 'instance_name', with: new_name
        fill_in 'instance_host',  with: new_host
        click_button 'Update'
      end

      it 'changes the attributes' do
        expect(instance.reload.name).to eq(new_name)
        expect(instance.reload.host).to eq(new_host)
      end
    end

    context 'with empty name' do
      before do
        fill_in 'instance_name', with: ''
        click_button 'Update'
      end

      it 'does not change name' do
        expect(instance.reload.name).not_to eq('')
      end

      it 'shows the error' do
        expect(page).to have_css('div.has-error')
      end
    end
  end

  describe 'index page' do
    let!(:instances) { create_list(:instance, 10) }
    before { visit admin_instances_path }

    it 'shows all instances' do
      instances.each do |instance|
        expect(page).to have_selector('div', text: instance.name)
      end
    end
  end
end
