import CourseAPI from 'api/course';
import { SkillListData } from 'types/course/assessment/skills/skills';
import { Operation } from 'types/store';
import * as actions from './actions';

const fetchSkills = (): Operation<void> => {
  return async (dispatch) =>
    CourseAPI.assessment.skills
      .index()
      .then((response) => {
        const data: SkillListData = response.data;
        console.log(data)
        dispatch(
          actions.saveSkillSettings({
            canCreateSkill: data.canCreateSkill,
            canCreateSkillBranch: data.canCreateSkillBranch,
            headerTitle: data.headerTitle,
            headerDescription: data.headerDescription,
          }),
        );
        dispatch(actions.saveSkillListData(data.skillBranches));
      })
      .catch((error) => {
        throw error;
      });
};

export function deleteSkillBranch(branchId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.assessment.skills.deleteBranch(branchId).then(() => {
      dispatch(actions.deleteAchievement(branchId));
    });
}

export default fetchSkills;
