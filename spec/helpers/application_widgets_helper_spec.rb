# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationWidgetsHelper, type: :helper do
  def stub_resource_button
    helper.define_singleton_method(:resource_button) do |_, _, _, url_options, _|
      url_options
    end
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#new_button' do
      let(:announcement) { create(:course_announcement) }
      let(:url_options) { new_course_announcement_path(announcement.course) }
      subject { helper.new_button(url_options) }

      it 'defaults to a btn-primary class' do
        expect(subject).to have_tag('a.btn.btn-primary')
      end
      it 'defaults to a file button' do
        expect(subject).to have_tag('i.fa-file')
      end

      context 'when URL options are specified' do
        before { stub_resource_button }
        context 'when a string is specified' do
          it 'is not modified' do
            expect(subject).to eq(url_options)
          end
        end

        context 'when a symbol is specified' do
          let(:url_options) { [announcement.course, :announcement] }
          it 'adds a :new at the start of the URL options' do
            expect(subject).to eq([:new] + url_options)
          end
        end
      end
    end

    describe '#edit_button' do
      let(:announcement) { create(:course_announcement) }
      let(:url_options) { [announcement.course, announcement] }
      subject { helper.edit_button(url_options) }

      it 'defaults to a btn-default class' do
        expect(subject).to have_tag('a.btn.btn-default')
      end
      it 'defaults to a file button' do
        expect(subject).to have_tag('i.fa-edit')
      end

      context 'when URL options are specified' do
        before { stub_resource_button }
        context 'when a string is specified' do
          let(:url_options) { edit_course_announcement_path(announcement.course, announcement) }
          it 'is not modified' do
            expect(subject).to eq(url_options)
          end
        end

        context 'when a resource is specified' do
          let(:url_options) { [announcement.course, announcement] }
          it 'adds a :edit at the start of the URL options' do
            expect(subject).to eq([:edit] + url_options)
          end
        end
      end
    end

    describe '#delete_button' do
      let(:announcement) { create(:course_announcement) }
      subject { helper.delete_button([announcement.course, announcement]) }
      it 'defaults to a btn-primary class' do
        expect(subject).to have_tag('a.btn.btn-danger')
      end
      it 'defaults to a file button' do
        expect(subject).to have_tag('i.fa-trash')
      end
      it 'sets the method as delete' do
        expect(subject).to have_tag('a', with: { 'data-method' => 'delete' })
      end
    end

    describe '#resource_button' do
      let(:announcement) { create(:course_announcement) }
      before { I18n.backend.store_translations(:en, en: { helpers: { buttons: { new: 'new' } } }) }
      after { I18n.backend.store_translations(:en, en: { helpers: { buttons: { new: nil } } }) }

      let(:body) { 'meh' }
      subject do
        helper.send(:resource_button, :new, 'btn-warning', body,
                    [announcement.course, announcement], nil)
      end

      it 'uses the key to determine the translation' do
        expect(subject).to have_tag('a.btn.btn-warning', text: body)
      end

      it 'adds the key to the button classes' do
        expect(subject).to have_tag('a.btn.new', text: body)
      end

      context 'when a block is provided to the body argument' do
        let(:text) { 'block!' }
        let(:body) { proc { text } }
        it 'calls the block to provide the body of the link' do
          expect(subject).to have_tag('a.btn.btn-warning', text: text)
        end
      end

      context 'when a resource is provided to the url_options argument' do
        it 'gives the title to the link' do
          title = 'helpers.buttons.announcement.new'
          expect(subject).to have_tag('a', with: { title: title })
        end
      end
    end

    describe '#deduce_resource_button_class' do
      let(:specified_classes) { [] }
      let(:default_class) { 'ignore' }
      let(:key) { :new }
      subject { helper.send(:deduce_resource_button_class, key, specified_classes, default_class) }

      it 'adds the btn class' do
        expect(subject).to include('btn')
      end

      it 'adds the key' do
        expect(subject).to include(key)
      end

      context 'when a button type is specified' do
        let(:specified_classes) { ['btn-default'] }
        it 'does not add the specified default class' do
          expect(subject).not_to include(default_class)
        end
      end

      context 'when no button type is specified' do
        it 'adds the specified default class' do
          expect(subject).to include('ignore')
        end
      end
    end

    describe '#deduce_resource_button_title' do
      before { helper.define_singleton_method(:t) { |key, hash| [key] + hash[:default] } }
      let(:announcement) { build(:course_announcement) }
      subject { helper.send(:deduce_resource_button_title, :edit, url_options) }

      context 'when given an array of resources' do
        let(:url_options) { [announcement] }
        it 'picks the last resource' do
          expect(subject).to contain_exactly(
            :'helpers.buttons.announcement.edit',
            :'helpers.buttons.edit',
            'Edit Announcement'
          )
        end

        context 'when given an array with an options hash' do
          let(:url_options) { [announcement, test: 'something'] }
          it 'picks the last resource' do
            expect(subject).to contain_exactly(
              :'helpers.buttons.announcement.edit',
              :'helpers.buttons.edit',
              'Edit Announcement'
            )
          end
        end
      end

      context 'when given a single resource' do
        let(:url_options) { announcement }
        it 'looks up the model name' do
          expect(subject).to contain_exactly(
            :'helpers.buttons.announcement.edit',
            :'helpers.buttons.edit',
            'Edit Announcement'
          )
        end
      end

      context 'when given a symbol' do
        let(:url_options) { :announcement }
        it 'guesses the human name of the symbol' do
          expect(subject).to contain_exactly(
            :'helpers.buttons.announcement.edit',
            :'helpers.buttons.edit',
            'Edit Announcement'
          )
        end
      end
    end

    describe '#display_progress_bar' do
      let(:default_class) { 'progress-bar-info' }
      subject { helper.display_progress_bar(50) }

      it 'returns a progress bar' do
        expect(subject).to have_tag('div.progress-bar', with: { role: 'progressbar' })
      end

      it 'specifies the correct percentage of the progress bar' do
        expect(subject).to have_tag('div.progress-bar', style: 'width: 50%')
      end

      it 'defaults to .progress-bar-info' do
        expect(subject).to include(default_class)
      end

      context 'when opts are specified' do
        let(:tooltip_title) { 'Foo' }
        let(:opts) { { class: ['progress-bar-striped'], title: tooltip_title } }
        subject { helper.display_progress_bar(50, opts) }

        it 'is reflected in the progress bar' do
          expect(subject).to have_tag('div.progress-bar.progress-bar-striped')
          expect(subject).to have_tag('div.progress-bar', title: tooltip_title)
        end
      end

      context 'when a block is given' do
        it 'appends the text within the progress bar' do
          expect(helper.display_progress_bar(50) { '30%' }).to include('30%')
        end

        it 'renders the block in the context of the helper' do
          message = 'foo'
          helper.define_singleton_method(:some_method) { message }
          expect(helper.display_progress_bar(50) { helper.some_method }).to include(message)
        end
      end
    end
  end
end
