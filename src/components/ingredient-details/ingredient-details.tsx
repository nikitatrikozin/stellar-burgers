import {
  fetchIngredients,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@slices/ingredientsSlice';
import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const ingredients = useSelector(selectIngredients);
  const status = useSelector(selectIngredientsStatus);
  const error = useSelector(selectIngredientsError);

  if (status === 'idle' || status === 'loading') {
    return <Preloader />;
  }

  if (status === 'failed') {
    return (
      <div>
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => {
            void dispatch(fetchIngredients());
          }}
        >
          Повторить загрузку
        </button>
      </div>
    );
  }

  const ingredientData = ingredients.find((ingredient) => ingredient._id === id);

  if (!ingredientData) {
    return <p className="text text_type_main-default">Ингредиент не найден</p>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
