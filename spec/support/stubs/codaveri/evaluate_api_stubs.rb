# rubocop: disable Metrics/ModuleLength
# frozen_string_literal: true
module Codaveri::EvaluateApiStubs
  def evaluate_success_final_result
    ids = test_cases_id_from_factory.map(&:to_s)
    {
      status: 200,
      body: {
        success: true,
        message: 'Evaluation successfully generated',
        data: {
          id: '6659878d3ad73c7a4aac96f0',
          exprResults: [
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                displayValue: '\'GCAUUU\'\n',
                success: 1
              },
              testcase: {
                index: ids[0].to_s
              }
            },
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                displayValue: '\'GCAUUU\'\n',
                success: 1
              },
              testcase: {
                index: ids[1].to_s
              }
            },
            {
              run: {
                stdout: 'True\n',
                stderr: '',
                code: 0,
                signal: nil,
                displayValue: 'True\n',
                success: 1
              },
              testcase: {
                index: ids[2].to_s
              }
            },
            {
              run: {
                stdout: 'True\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: 'True\n',
                success: 1
              },
              testcase: {
                index: ids[3].to_s
              }
            },
            {
              run: {
                stdout: 'False\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: 'False\n',
                success: 1
              },
              testcase: {
                index: ids[4].to_s
              }
            },
            {
              run: {
                stdout: '\'rna\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: '\'rna\'\n',
                success: 1
              },
              testcase: {
                index: ids[5].to_s
              }
            },
            {
              run: {
                stdout: '\'dna\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: '\'dna\'\n',
                success: 1
              },
              testcase: {
                index: ids[6].to_s
              }
            }
          ]
        },
        transactionId: '66598c55fac28dd29e968852'
      }.to_json
    }
  end

  def evaluate_error_status_final_result
    ids = test_cases_id_from_factory.map(&:to_s)
    {
      status: 200,
      body: {
        success: true,
        message: 'Evaluation successfully generated',
        data: {
          id: '6659878d3ad73c7a4aac96f0',
          exprResults: [
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: 'Error',
                code: 0,
                signal: nil,
                displayValue: '\'GCAUUU\'\n',
                success: 0,
                status: 'RE',
                message: 'Runtime Error'
              },
              testcase: {
                index: ids[0].to_s
              }
            },
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: 'Error',
                code: 0,
                signal: 'SIGKILL',
                displayValue: '\'GCAUUU\'\n',
                success: 0,
                status: 'SG',
                message: 'Killed'
              },
              testcase: {
                index: ids[1].to_s
              }
            },
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: 'Error',
                code: 0,
                signal: nil,
                displayValue: '\'GCAUUU\'\n',
                success: 0,
                status: 'TO',
                message: 'Timeout'
              },
              testcase: {
                index: ids[2].to_s
              }
            },
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: 'Error',
                code: 0,
                signal: nil,
                displayValue: '\'GCAUUU\'\n',
                success: 0,
                status: 'XX',
                message: 'Internal Run Error'
              },
              testcase: {
                index: ids[3].to_s
              }
            }
          ]
        },
        transactionId: '66598c55fac28dd29e968852'
      }.to_json
    }
  end

  def evaluate_failure_final_result
    {
      status: 400,
      body: {
        success: false,
        message: 'Invalid request body: Files.path should be of type string, Files.path cannot be empty',
        errorCode: '12',
        data: {},
        transactionId: '66598c55fac28dd29e968852'
      }.to_json
    }
  end

  EVALUATE_ID_CREATED = {
    status: 201,
    body: {
      success: true,
      message: 'Evaluation request received',
      data: {
        id: '6659878d3ad73c7a4aac96f0'
      },
      transactionId: '66598c55fac28dd29e968853'
    }.to_json
  }.freeze

  EVALUATE_RESULTS_PENDING = {
    status: 202,
    body: {
      success: true,
      message: 'Evaluation results not ready yet',
      data: {},
      transactionId: '6659878d3ad73c7a4aac96f0'
    }.to_json
  }.freeze

  def evaluate_wrong_answer_final_result
    ids = test_cases_id_from_factory.map(&:to_s)
    {
      status: 200,
      body: {
        success: true,
        message: 'Evaluation successfully generated',
        data: {
          exprResults: [
            {
              run: {
                stdout: '\'GCAUUA\'\n',
                stderr: '',
                code: 1,
                signal: nil,
                stdin: '',
                displayValue: '\'GCAUUA\'\n',
                success: 0
              },
              testcase: {
                index: ids[0].to_s
              }
            },
            {
              run: {
                stdout: '\'GCAUUU\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: '\'GCAUUU\'\n',
                success: 1
              },
              testcase: {
                index: ids[1].to_s
              }
            },
            {
              run: {
                stdout: 'True\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: 'True\n',
                success: 1
              },
              testcase: {
                index: ids[2].to_s
              }
            },
            {
              run: {
                stdout: 'True\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: 'True\n',
                success: 1
              },
              testcase: {
                index: ids[3].to_s
              }
            },
            {
              run: {
                stdout: 'False\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: 'False\n',
                success: 1
              },
              testcase: {
                index: ids[4].to_s
              }
            },
            {
              run: {
                stdout: '\'rna\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: '\'rna\'\n',
                success: 1
              },
              testcase: {
                index: ids[5].to_s
              }
            },
            {
              run: {
                stdout: '\'dna\'\n',
                stderr: '',
                code: 0,
                signal: nil,
                stdin: '',
                displayValue: '\'dna\'\n',
                success: 1
              },
              testcase: {
                index: ids[6].to_s
              }
            }
          ]
        }
      }.to_json
    }
  end

  def test_cases_id_from_factory
    Course::Assessment::Question::Programming.last.test_cases.pluck(:id)
  end

  module_function \
    :evaluate_error_status_final_result,
    :evaluate_failure_final_result,
    :evaluate_success_final_result,
    :evaluate_wrong_answer_final_result,
    :test_cases_id_from_factory
end
# rubocop: enable Metrics/ModuleLength
