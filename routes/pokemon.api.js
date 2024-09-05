const express = require("express");
const fs = require("fs");
const { parse } = require("path");
const { stringify } = require("querystring");
const router = express.Router();

const allowedFilter = ["type", "search", "page", "limit"];

router.get("/", (req, res, next) => {
  try {
    // Lấy các tham số từ query string
    let { page, limit, type, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    // Kiểm tra và loại bỏ các tham số không hợp lệ
    Object.keys(req.query).forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
    });

    let offset = limit * (page - 1);

    // Đọc dữ liệu từ file JSON
    let pokemonData = JSON.parse(fs.readFileSync("pokemon.json", "utf-8"));
    let result = pokemonData.data;
    const { totalPokemons } = pokemonData;
    // Lọc theo type
    if (type) {
      const searchType = type.toLowerCase();
      result = result.filter((pokemon) =>
        pokemon.types.map((t) => t.toLowerCase()).includes(searchType)
      );
    }

    // Lọc theo search
    if (search) {
      const searchName = search.toLowerCase();
      result = result.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchName)
      );
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No Pokémon found" });
    }

    // Phân trang
    const paginatedResult = result.slice(offset, offset + limit);

    // Trả về kết quả
    res.status(200).json({
      data: paginatedResult,
      totalPokemons,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    let pokemonData = JSON.parse(fs.readFileSync("pokemon.json", "utf-8"));
    const pokemonId = parseInt(req.params.id);

    const pokemonIndex = pokemonData.data.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );

    if (!pokemonIndex && pokemonIndex === -1) {
      const exception = new Error(`Pokémon with id ${pokemonId} not found`);
      exception.statusCode = 404;
      throw exception;
    }

    const pokemonCurrent = pokemonData.data[pokemonIndex];
    const pokemonNext =
      pokemonData.data[(pokemonIndex + 1) % pokemonData.data.length];
    const pokemonPrevious =
      pokemonData.data[
        (pokemonIndex - 1 + pokemonData.data.length) % pokemonData.data.length
      ];

    const newData = {
      pokemon: pokemonCurrent,
      nextPokemon: pokemonNext,
      previousPokemon: pokemonPrevious,
    };

    console.log("Next Pokémon Index:", pokemonNext);
    res.status(200).json({ data: newData });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    let { id } = req.params;
    const updates = req.body;

    // Đọc dữ liệu hiện tại từ file
    let pokemon = JSON.parse(fs.readFileSync("pokemon.json", "utf-8"));
    // Tìm mục cần cập nhật
    const targetIndex = pokemon.data.findIndex((e) => e.id === parseInt(id));

    if (targetIndex < 0 && !targetIndex) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      return next(exception);
    }
    

    // Cập nhật dữ liệu
    const updatePokemon = {
      ...pokemon.data[targetIndex],
      ...updates,
    };

    pokemon.data[targetIndex] = updatePokemon;

    // Ghi dữ liệu đã cập nhật vào file
    fs.writeFileSync("pokemon.json", JSON.stringify(pokemon));
    res.status(200).send(updatePokemon);
  } catch (error) {
    next(error);
  }
});


router.delete("/:id", (req, res, next) => {
  try {
    let { id } = req.params;
    id = parseInt(id)
    let pokemon = JSON.parse(fs.readFileSync("pokemon.json", "utf-8"));
 
    const { data } = pokemon;
    const targetId = data.findIndex((e) => e.id === id);
    console.log("Index of Pokémon to delete:", targetId); // Kiểm tra index
    console.log(targetId)
    if (targetId < 0) {
      const exception = new Error("Not Found");
      exception.statusCode = 404;
      throw exception;
    }

    pokemon.data = data.filter((e) => e.id !== id);
    pokemon = JSON.stringify(pokemon);
    fs.writeFileSync("pokemon.json", pokemon);
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
