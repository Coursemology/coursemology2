# frozen_string_literal: true
class Course::LearningMapController < Course::ComponentController
  NODE_ID_DELIMITER = '-'
  NEGATIVE_INF = -1_000_000_000

  before_action :authorize_learning_map
  add_breadcrumb :index, :course_learning_map_path

  def index
    init_conditionals

    respond_to do |format|
      format.html
      format.json do
        render json: { nodes: map_conditionals_to_nodes, can_modify: current_course_user&.teaching_staff? }
      end
    end
  end

  def add_parent_node
    condition = create_condition(parent_and_node_id_pair_params[:parent_node_id])
    conditional = get_conditional(parent_and_node_id_pair_params[:node_id])
    condition.conditional = conditional

    if condition.save
      index
    else
      error_response(condition.errors.full_messages)
    end
  end

  def remove_parent_node
    condition = get_condition(parent_and_node_id_pair_params[:parent_node_id],
                              parent_and_node_id_pair_params[:node_id])

    if condition.destroy
      index
    else
      error_response(condition.errors.full_messages)
    end
  end

  def toggle_satisfiability_type
    conditional = get_conditional(node_params[:node_id])

    if conditional.satisfiability_type.to_s == :all_conditions.to_s
      conditional.set_at_least_one_condition_satisfiability_type!
    else
      conditional.set_all_conditions_satisfiability_type!
    end

    if conditional.save
      index
    else
      error_response(conditional.errors.full_messages)
    end
  end

  private

  def authorize_learning_map
    authorize!(:manage, @conditionals)
  end

  # @return [Course::LearningMapComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_learning_map_component]
  end

  def error_response(errors)
    respond_to do |format|
      format.html
      format.json do
        render json: { errors: errors }, status: :bad_request
      end
    end
  end

  def init_conditionals
    @conditionals = Course::Condition.preload(:conditions).conditionals_for(current_course)
  end

  def map_conditionals_to_nodes
    all_node_relations = generate_all_node_relations
    nodes = generate_nodes_from_conditionals(all_node_relations)
    generate_node_depths(nodes)
  end

  def generate_all_node_relations
    relations = init_all_node_relations
    node_ids_to_children = relations[:node_ids_to_children]
    node_ids_to_parents = relations[:node_ids_to_parents]

    @conditionals.each do |conditional|
      node_id = get_node_id(conditional)

      conditional.conditions.each do |condition|
        next if condition.actable_type == Course::Condition::Level.name

        parent = map_condition_to_parent(condition)
        node_ids_to_children[parent[:id]].push({ id: node_id, is_satisfied: parent[:is_satisfied] })
        node_ids_to_parents[node_id].push(parent)
      end
    end

    { node_ids_to_children: node_ids_to_children, node_ids_to_parents: node_ids_to_parents }
  end

  def init_all_node_relations
    { node_ids_to_children: @conditionals.map { |conditional| [get_node_id(conditional), []] }.to_h,
      node_ids_to_parents: @conditionals.map { |conditional| [get_node_id(conditional), []] }.to_h }
  end

  def map_condition_to_parent(condition)
    type = condition.actable_type.demodulize
    typed_condition = Object.const_get("Course::Condition::#{type}").find(condition.actable_id)
    id = "#{type.downcase}-#{typed_condition.send("#{type.downcase}_id")}"

    { id: id, is_satisfied: typed_condition.satisfied_by?(current_course_user) }
  end

  def generate_nodes_from_conditionals(all_node_relations)
    node_ids_to_children = all_node_relations[:node_ids_to_children]
    node_ids_to_parents = all_node_relations[:node_ids_to_parents]

    @conditionals.map do |conditional|
      id = get_node_id(conditional)

      conditional.attributes.merge({
        id: id, unlocked: conditional.conditions_satisfied_by?(current_course_user),
        children: node_ids_to_children[id], satisfiability_type: conditional.satisfiability_type,
        course_material_type: conditional.class.name.demodulize.downcase,
        content_url: url_for([current_course, conditional]), parents: node_ids_to_parents[id]
      }).symbolize_keys
    end
  end

  def generate_node_depths(nodes)
    toposorted_nodes = toposort(nodes)
    depths = init_depths(nodes)

    toposorted_nodes.each do |node|
      node_id = node[:id]

      node[:children].each do |child|
        child_id = child[:id]
        depths[child_id] = depths[node_id] + 1 if depths[child_id] < depths[node_id] + 1
      end
    end

    nodes.map { |node| node.merge({ depth: depths[node[:id]] }) }
  end

  def init_depths(nodes)
    nodes.map { |node| [node[:id], node[:parents].empty? ? 0 : NEGATIVE_INF] }.to_h
  end

  def toposort(nodes)
    visited_node_ids = Set.new
    post_order_nodes = []
    node_ids_to_nodes = nodes.map { |node| [node[:id], node] }.to_h

    nodes.each do |node|
      dfs(node, node_ids_to_nodes, visited_node_ids, post_order_nodes) unless visited_node_ids.include?(node[:id])
    end

    post_order_nodes.reverse
  end

  def dfs(node, node_ids_to_nodes, visited_node_ids, post_order_nodes)
    visited_node_ids.add(node[:id])

    node[:children].each do |child|
      dfs(node_ids_to_nodes[child[:id]], node_ids_to_nodes, visited_node_ids, post_order_nodes) unless
        visited_node_ids.include?(child[:id])
    end

    post_order_nodes.push(node)
  end

  def parent_and_node_id_pair_params
    params.permit(:parent_node_id, :node_id)
  end

  def node_params
    params.permit(:node_id)
  end

  def get_node_id(conditional)
    "#{conditional.class.name.demodulize.downcase}#{NODE_ID_DELIMITER}#{conditional.id}"
  end

  def create_condition(node_id)
    node_id_tokens = node_id.split(NODE_ID_DELIMITER)

    condition = Object.const_get("Course::Condition::#{node_id_tokens[0].capitalize}").new
    condition.course = current_course
    dependent_object = get_conditional(node_id)
    condition.send("#{dependent_object.class.name.demodulize.downcase}=", dependent_object)

    condition
  end

  def get_conditional(node_id)
    node_id_tokens = node_id.split(NODE_ID_DELIMITER)
    Object.const_get("Course::#{node_id_tokens[0].capitalize}").find(node_id_tokens[1].to_i)
  end

  def get_condition(parent_node_id, node_id)
    parent_node_id_tokens = parent_node_id.split(NODE_ID_DELIMITER)
    node_id_tokens = node_id.split(NODE_ID_DELIMITER)

    Object.const_get("Course::Condition::#{parent_node_id_tokens[0].capitalize}").find do |condition|
      condition.conditional_id == node_id_tokens[1].to_i &&
        condition.send("#{parent_node_id_tokens[0].downcase}_id") == parent_node_id_tokens[1].to_i
    end
  end
end
