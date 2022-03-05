module.exports = app => {
    // import validations
    const { notEqualsError, notExistsError, existsError,  notIncrementIdError} = app.api.utils.functions.validation

    // * insert or edit a category
    const save = async (req, res) => {
        // Cloning the body to category object
        const category = { ...req.body }

        if (req.params.id)
            category.id = req.params.id

        try {
            // Validate fields
            notExistsError(category.name, 'Empty name')

            // gets the user by username
            const categoryFromDB = await app.db('category')
                .where({ cat_name: category.name }).first()

            // Validates if already exists
            if (category.id)
                existsError(categoryFromDB, 'Category already exists')

        } catch (error) {
            return res.status(400).send(error)
        }

        // Creating an object with the same key names of the db
        const categoryToDB = app.utils.cloneObjWithDBPrefix(category, 'cat_')

        // edit category
        if (category.id) {
            app.db('category')
                .update(categoryToDB)
                .where({ cat_id: categoryToDB.cat_id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else { // create category
            app.db('category')
                .insert(categoryToDB)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    // * get all categories
    const get = (req, res) => {
        app.db('category')
            .select('cat_id as id',
                'cat_name as name',
                'cat_description as description'
            ).then(categories => res.json(categories))
            .catch(err => res.status(500).send(err))
    }

    // * get category by id
    const getById = (req, res) => {
        const id = req.params.id
        app.db('category')
            .select('cat_id as id',
                'cat_name as name',
                'cat_description as description'
            ).where({ cat_id: id }).first()
            .then(categories => res.json(categories))
            .catch(err => res.status(500).send(err))
    }

    // * delete category by id
    const remove = async (req, res) => {
        try {
            const id = req.params.id
            notIncrementIdError(id, 'Invalid id')
            const rowsDeleted = await app.db('category')
                .where({ cat_id: id }).first()
                .del()
            notExistsError(rowsDeleted, 'Category not found')
            res.status(204).send()
        } catch (msg) {
            res.status(500).send(msg)
        }
    }

    // * add an item to the category
    const addItem = (req, res) => {

        // Cloning the body to categoryItem object
        const categoryItem = { ...req.body }

        try {
            // Validate fields
            notExistsError(categoryItem.name, 'Empty name')
            notExistsError(categoryItem.category, 'Invalid category')
        } catch (error) {
            return res.status(400).send(error)
        }

        // Creating an object with the same key names of the db
        const categoryItemToDB = app.utils.cloneObjWithDBPrefix(categoryItem, 'it_')

        app.db('category_item')
                .insert(categoryItemToDB)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
    }

    return { save, get, getById, remove, addItem }
}