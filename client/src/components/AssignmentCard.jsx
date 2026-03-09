import { useNavigate } from "react-router-dom";
import "./AssignmentCard.scss";

const AssignmentCard = ({ assignment }) => {
  const navigate = useNavigate();

  return (
    <article className="assignment-card">
      <span className={`assignment-card__difficulty assignment-card__difficulty--${assignment.difficulty}`}>
        {assignment.difficulty}
      </span>

      <h2 className="assignment-card__title">{assignment.title}</h2>

      <p className="assignment-card__description">{assignment.description}</p>

      <button
        className="assignment-card__cta"
        type="button"
        onClick={() => navigate(`/assignment/${assignment._id}`)}
      >
        Solve Assignment
      </button>
    </article>
  );
};

export default AssignmentCard;
