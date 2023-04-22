class MenuItems {
  generateMarkUp() {
    return `
    <div class="modal__label">players</div>
    <div class="modal__select">
      <div class="radio__box">
        <input
          class="player__1"
          type="radio"
          id="player__1"
          name="drone"
          value="player__1"
          
        />
        <label for="player__1">&nbsp1</label>
      </div>

      <div class="radio__box">
        <input
          class="player__2"
          type="radio"
          id="player__2"
          name="drone"
          value="player__2"
          checked
        />
        <label for="player__2">&nbsp2</label>
      </div>
    </div>

    <div class="modal__label">minutes</div>
    <div class="modal__select">
      <div class="radio__box">
        <input
          class="time__1"
          type="radio"
          id="time__1"
          name="time"
          value="0.1"
          checked
        />
        <label for="time__1">&nbsp1</label>
      </div>

      <div class="radio__box">
        <input
          class="time__3"
          type="radio"
          id="time__3"
          name="time"
          value="3"
          
        />
        <label for="time__3">&nbsp3</label>
      </div>

      <div class="radio__box">
        <input
          class="time__5"
          type="radio"
          id="time__5"
          name="time"
          value="5"
        />
        <label for="time__5">&nbsp5</label>
      </div>
    </div>

    <div class="modal__label">
      <!-- <img class="flag__icon" src="./flag.png" alt="" /> -->
      flags</div>
    <div class="modal__select">
      <div class="radio__box">
        <input
          class="flag__1"
          type="radio"
          id="flag__1"
          name="flags"
          value="1"
        />
        <label for="flag__1">&nbsp1</label>
      </div>

      <div class="radio__box">
        <input
          class="flag__3"
          type="radio"
          id="flag__3"
          name="flags"
          value="3"
        />
        <label for="flag__3">&nbsp3</label>
      </div>

      <div class="radio__box">
        <input
          class="flag__5"
          type="radio"
          id="flag__5"
          name="flags"
          value="5"
          checked
        />
        <label for="flag__5">&nbsp5</label>
      </div>

      <div class="radio__box">
        <input
          class="flag__10"
          type="radio"
          id="flag__10"
          name="flags"
          value="10"
        />
        <label for="flag__10">&nbsp10</label>
      </div>
    </div>

    <button class="btn btn__start">New</button>
        `;
  }
}
export default new MenuItems();
