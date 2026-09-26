import { expect, test } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/**',
      notFound: 'abort',
    });

    await page.goto('/');
  });

  test('Добавляет выбранную начинку из каталога в конструктор', async ({ page }) => {
    const ingredientName = 'Биокотлета из марсианской Магнолии';

    const ingredientCard = page.getByRole('listitem').filter({
      has: page.getByRole('link', { name: ingredientName }),
    });

    const constructorIngredients = page.getByTestId('constructor-ingredients');

    await expect(
      constructorIngredients.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();

    await ingredientCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(
      constructorIngredients.getByText(ingredientName, { exact: true })
    ).toBeVisible();

    await expect(constructorIngredients.getByRole('listitem')).toHaveCount(1);

    await expect(
      constructorIngredients.getByText('Выберите начинку', { exact: true })
    ).toHaveCount(0);
  });

  test('Добавляет верхнюю и нижнюю половины выбранной булки', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';

    const bunCard = page.getByRole('listitem').filter({
      has: page.getByRole('link', { name: bunName }),
    });

    const burgerConstructor = page.getByTestId('constructor');
    const topBun = page.getByTestId('constructor-bun-1');
    const bottomBun = page.getByTestId('constructor-bun-2');
    const constructorIngredients = page.getByTestId('constructor-ingredients');

    await expect(
      burgerConstructor.getByText('Выберите булки', { exact: true })
    ).toHaveCount(2);

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(topBun).toBeVisible();
    await expect(topBun).toContainText(`${bunName} (верх)`);

    await expect(bottomBun).toBeVisible();
    await expect(bottomBun).toContainText(`${bunName} (низ)`);

    await expect(
      burgerConstructor.getByText('Выберите булки', { exact: true })
    ).toHaveCount(0);

    await expect(
      constructorIngredients.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();
  });

  test.describe('Модальное окно ингредиента', () => {
    test('Показывает данные выбранного ингредиента и закрывается крестиком', async ({
      page,
    }) => {
      const ingredientName = 'Краторная булка N-200i';
      const modal = page.getByTestId('modal');

      await page.getByRole('link', { name: ingredientName }).click();

      await expect(modal).toBeVisible();

      await expect(
        modal.getByRole('heading', {
          name: ingredientName,
          exact: true,
        })
      ).toBeVisible();

      await expect(
        modal.getByRole('img', {
          name: 'изображение ингредиента.',
          exact: true,
        })
      ).toHaveAttribute('src', 'https://code.s3.yandex.net/react/code/bun-02-large.png');

      const nutrition = modal.getByRole('listitem');

      await expect(
        nutrition.filter({ hasText: 'Калории, ккал' }).getByText('420', { exact: true })
      ).toBeVisible();

      await expect(
        nutrition.filter({ hasText: 'Белки, г' }).getByText('80', { exact: true })
      ).toBeVisible();

      await expect(
        nutrition.filter({ hasText: 'Жиры, г' }).getByText('24', { exact: true })
      ).toBeVisible();

      await expect(
        nutrition.filter({ hasText: 'Углеводы, г' }).getByText('53', { exact: true })
      ).toBeVisible();

      await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();

      await expect(modal).toHaveCount(0);
      await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    });

    test('Закрывается при клике на оверлей', async ({ page }) => {
      const modal = page.getByTestId('modal');
      const overlay = page.getByTestId('modal-overlay');

      await page.getByRole('link', { name: 'Краторная булка N-200i' }).click();

      await expect(modal).toBeVisible();

      await overlay.click({ position: { x: 10, y: 10 } });

      await expect(modal).toHaveCount(0);
      await expect(overlay).toHaveCount(0);
    });
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/**',
      notFound: 'abort',
    });

    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/**',
      notFound: 'fallback',
    });

    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer fake-access-token',
        url: 'http://localhost:4000',
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.goto('/');
  });

  test('Создаёт заказ, показывает его номер и очищает конструктор', async ({ page }) => {
    const bunName = 'Краторная булка N-200i';
    const fillingName = 'Биокотлета из марсианской Магнолии';

    const bunCard = page.getByRole('listitem').filter({
      has: page.getByRole('link', { name: bunName }),
    });

    const fillingCard = page.getByRole('listitem').filter({
      has: page.getByRole('link', { name: fillingName }),
    });

    const burgerConstructor = page.getByTestId('constructor');
    const constructorIngredients = page.getByTestId('constructor-ingredients');
    const modal = page.getByTestId('modal');

    await bunCard.getByRole('button', { name: 'Добавить' }).click();
    await fillingCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByTestId('constructor-bun-1')).toContainText(
      `${bunName} (верх)`
    );
    await expect(page.getByTestId('constructor-bun-2')).toContainText(
      `${bunName} (низ)`
    );
    await expect(
      constructorIngredients.getByText(fillingName, { exact: true })
    ).toBeVisible();

    await burgerConstructor
      .getByRole('button', { name: 'Оформить заказ', exact: true })
      .click();

    await expect(modal).toBeVisible();
    await expect(modal.getByTestId('order-number')).toHaveText('12345');

    await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);
    await expect(page.getByTestId('constructor-bun-2')).toHaveCount(0);

    await expect(
      burgerConstructor.getByText('Выберите булки', { exact: true })
    ).toHaveCount(2);

    await expect(
      constructorIngredients.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();

    await expect(
      constructorIngredients.getByText(fillingName, { exact: true })
    ).toHaveCount(0);

    await expect(constructorIngredients.getByRole('listitem')).toHaveCount(1);

    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();

    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
  });
});
