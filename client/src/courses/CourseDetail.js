import '../public/css/course/courseDetail.css';
import React from "react";
import CompNavbar from '../template/Nabvar';
import CompFooter from '../template/Footer';
import { useUserContext } from '../hooks/UserContext';

const CourseDetailComponent = ({ course}) => {
    const { userData } = useUserContext();

    let user = userData;
  return (
    <>
    <CompNavbar user={user}/>
  <p>course detail</p>
    <CompFooter />
    </>
  );
};

export default CourseDetailComponent;
