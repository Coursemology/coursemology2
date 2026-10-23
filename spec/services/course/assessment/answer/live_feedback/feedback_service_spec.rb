# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::LiveFeedback::FeedbackService do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:answer) do
      create(:course_assessment_answer_programming, file_name_contents: [['a.py', 'x = 1'], ['b.py', 'y = 2']]).
        acting_as
    end

    subject { described_class.new('Why does my code fail?', answer) }

    describe '#construct_feedback_object' do
      it 'sends the answer files with the message' do
        files = subject.construct_feedback_object[:message][:files]

        expect(files).to eq([{ path: 'a.py', content: 'x = 1' }, { path: 'b.py', content: 'y = 2' }])
      end

      context 'when the question needs a generated main file' do
        let(:main_file) { { path: '_coursemology_main.py', content: "import a\n" } }

        before do
          allow(Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService).
            to receive(:generated_answer_files).and_return([main_file])
        end

        it 'sends it first, asking for no feedback on it' do
          files = subject.construct_feedback_object[:message][:files]

          expect(files.first).to eq(main_file.merge(requiresFeedback: false))
          expect(files.drop(1).map { |file| file[:path] }).to eq(['a.py', 'b.py'])
        end
      end
    end
  end
end
