import React, { useState } from "react";
import { WithContext as ReactTags } from "react-tag-input";
import PropTypes from "prop-types";
import "./input.css";

const InputTag = ({ seedTags, suggestions, handleDelete, handleAddition, disabled = false }) => {
  const [inputValue, setInputValue] = useState("");
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.text.toLowerCase().startsWith(inputValue.toLowerCase())
  );

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleTagAddition = (tag) => {
    const isValidTag = suggestions.some(
      (suggestion) => suggestion.text.toLowerCase() === tag.text.toLowerCase()
    );

    if (isValidTag) {
      handleAddition(tag);
      setInputValue("");
      setTimeout(() => {
        document.querySelector(".ReactTags__tagInput input").focus();
      }, 0);
    } else {
      console.warn("Tag not in suggestions:", tag.text);
      //   handleAddition(null);
    }
  };
  const inputStyle = {
    display: seedTags.length < 16 ? "block" : "none", 
  };
  return (
    <div className="input-tag-container">
      <ReactTags
        tags={seedTags}
        handleDelete={handleDelete}
        handleAddition={handleTagAddition}
        delimiters={[32, 13]}
        maxTags={16}
        placeholder="Enter your seed.."
        handleInputChange={handleInputChange}
        inputValue={inputValue}
        inputProps={{
          style: inputStyle,
          disabled: disabled || seedTags.length >= 16,
        }}
      />
      {inputValue && filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="suggestion-item"
              onClick={() => {
                handleTagAddition({ id: suggestion.id, text: suggestion.text });
              }}
            >
              {suggestion.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

InputTag.propTypes = {
  seedTags: PropTypes.array.isRequired,
  suggestions: PropTypes.array.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleAddition: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default InputTag;
