# frozen_string_literal: true
class System::Admin::MarketplaceAllowlistRulesController < System::Admin::Controller
  # `preview` is a collection action with no id, so CanCan's default loader would try
  # `find(params[:id])`. It builds its own unsaved rule; System::Admin::Controller's
  # `authorize_admin` already gates the whole controller.
  load_and_authorize_resource :allowlist_rule,
                              class: 'Course::Assessment::Marketplace::AllowlistRule',
                              parent: false, except: [:preview]

  def index
    # "Everyone" is a page-level mode, not a table row: expose its presence as `@everyone_rule`
    # and show only the scoped rules in the table.
    @everyone_rule = @allowlist_rules.rule_type_everyone.first
    @allowlist_rules = @allowlist_rules.where.not(rule_type: :everyone).includes(:user, :instance)
  end

  def create
    if @allowlist_rule.save
      # `render partial:` (not `render 'rule'`) — the view is the `_rule` partial. Mirrors
      # System::Admin::AnnouncementsController#create (`render partial: '.../announcement_data'`).
      render partial: 'rule', locals: { rule: @allowlist_rule }, status: :ok
    else
      render json: { errors: @allowlist_rule.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def preview
    rule = Course::Assessment::Marketplace::AllowlistRule.new(allowlist_rule_params)
    unless rule.valid?
      render json: { errors: rule.errors.full_messages.to_sentence }, status: :bad_request
      return
    end

    query = Course::Assessment::Marketplace::RulePreviewQuery.new(rule)
    @rows = query.rows
    @summary = query.summary
  end

  def destroy
    if @allowlist_rule.destroy
      head :ok
    else
      render json: { errors: @allowlist_rule.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def allowlist_rule_params
    params.require(:allowlist_rule).permit(:rule_type, :user_id, :instance_id, :email_domain, :email)
  end
end
