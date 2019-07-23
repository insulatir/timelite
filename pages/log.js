import React, { useContext, useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import styled from "styled-components";

import Page from "../components/page";
import { Context } from "../components/context";
import strings from "../l10n/log";
import { timeString } from "../utils/time";

const Log = () => {
  const { state, dispatch } = useContext(Context);
  const [filter, setFilter] = useState({ type: "SHOW_ALL" });

  strings.setLanguage(state.language);

  const getTags = entries => {
    let tags = [];
    entries.map(entry => tags.push(...entry.tags));
    return [...new Set(tags)];
  };

  const getVisibleEntries = (entries, filter) => {
    switch (filter.type) {
      case "SHOW_ALL":
        return entries;
      case "SHOW_TAG":
        return entries.filter(entry => entry.tags.includes(filter.tag));
      default:
        return entries;
    }
  };

  const getTotalMilliseconds = () => {
    return state.log.reduce((total, entry) => {
      return total + (entry.end - entry.start);
    }, 0);
  };

  const getVisibleTotalMilliseconds = () => {
    return getVisibleEntries(state.log, filter).reduce((total, entry) => {
      return total + (entry.end - entry.start);
    }, 0);
  };

  return (
    <Page title="Log">
      <Main>
        <TopBar>
          <Heading>{strings.log}</Heading>
          {state.log.length > 0 && (
            <>
              <Start>
                <span>{strings.start}</span>
                {state.log[state.log.length - 1].start.toLocaleTimeString()}
              </Start>
              <Total>
                <span>{strings.subtotal}</span>
                {timeString(getVisibleTotalMilliseconds())}
              </Total>
              <Total>
                <span>{strings.total}</span>
                {timeString(getTotalMilliseconds())}
              </Total>
            </>
          )}
        </TopBar>
        {getTags(state.log).length > 0 && (
          <Filters>
            <span>Tags</span>
            {getTags(state.log).map(tag => {
              return (
                <FilterButton
                  key={tag}
                  onClick={() => setFilter({ type: "SHOW_TAG", tag: tag })}
                >
                  {tag}
                </FilterButton>
              );
            })}
            <FilterButton onClick={() => setFilter({ type: "SHOW_ALL" })}>
              Show All
            </FilterButton>
          </Filters>
        )}
        {getVisibleEntries(state.log, filter).length > 0 ? (
          <>
            <TransitionGroup component={null}>
              {getVisibleEntries(state.log, filter).map((entry, index) => {
                const timeout = (index + 1) * 250;
                const transitionDelay = index * 125;
                return (
                  <CSSTransition
                    key={entry.id}
                    appear
                    timeout={{ appear: timeout, enter: 250, exit: 250 }}
                    classNames="fade"
                  >
                    <Entry style={{ transitionDelay: `${transitionDelay}ms` }}>
                      <EntryTime>
                        {timeString(entry.end - entry.start)}
                      </EntryTime>
                      <EntryNote>
                        {entry.note}
                        {entry.tags.length > 0 && (
                          <small>
                            {entry.tags
                              .map(tag => {
                                return tag;
                              })
                              .join(", ")}
                          </small>
                        )}
                      </EntryNote>
                      <EntryRemove
                        onClick={() => {
                          dispatch({ type: "REMOVE_LOG", id: entry.id });
                        }}
                      >
                        x
                      </EntryRemove>
                    </Entry>
                  </CSSTransition>
                );
              })}
            </TransitionGroup>
            <BottomBar>
              <Reset onClick={() => dispatch({ type: "RESET_LOG" })}>
                {strings.clear}
              </Reset>
            </BottomBar>
          </>
        ) : (
          <Nothing>{strings.nothing}</Nothing>
        )}
      </Main>
    </Page>
  );
};

export default Log;

const Main = styled.main`
  grid-area: main;
  min-height: 100vh;
  padding-top: 50px;
  padding-bottom: 50px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  display: flex;
  margin-bottom: 40px;
  justify-content: space-between;
  align-items: flex-end;
`;

const Heading = styled.h1`
  font-size: 5em;
  font-weight: lighter;
  margin-top: 0;
  margin-bottom: 0;
  &::before {
    content: "";
    width: 50px;
    height: 5px;
    background-color: blue;
    display: block;
  }
  @media (${props => props.theme.breakpoint}) {
    font-size: 2em;
  }
`;

const Filters = styled.div`
  margin-top: 30px;
  margin-bottom: 30px;
  & span {
    font-size: 0.8em;
    text-transform: uppercase;
    font-weight: lighter;
    display: block;
  }
`;

const FilterButton = styled.button`
  background: green;
  border-radius: 3px;
  padding: 6px 9px;
  color: white;
  border: none;
  margin-right: 10px;
  margin-top: 10px;
  cursor: pointer;
`;

const Entry = styled.div`
  background-color: #ffffff;
  color: black;
  margin-bottom: 15px;
  border-radius: 3px;
  display: grid;
  grid-template-columns: 150px 1fr 50px;
  align-items: center;

  &.fade-appear,
  &.fade-enter {
    opacity: 0;
    transform: translateX(-100px);
  }
  &.fade-appear-active,
  &.fade-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition-duration: 250ms;
    transition-property: opacity, transform;
  }
  &.fade-exit {
    opacity: 1;
    transform: translateX(0);
  }
  &.fade-exit-active {
    opacity: 0;
    transition-delay: 0ms !important;
    transition-duration: 250ms;
    transition-property: opacity, transform;
    transform: translateX(100px);
  }

  @media (${props => props.theme.breakpoint}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    text-align: center;
  }
`;

const EntryTime = styled.div`
  font-weight: bold;
  font-size: 1.3em;
  padding: 15px;
  height: 100%;
  background-color: #e2e2e2;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
`;

const EntryNote = styled.div`
  padding: 15px;
  & small {
    display: block;
    color: gray;
    margin-top: 5px;
  }
`;

const EntryRemove = styled.button`
  font-size: 1.3em;
  font-weight: bolder;
  color: white;
  cursor: pointer;
  border: 0;
  background: red;
  margin: 0;
  padding: 15px;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  height: 100%;
  @media (${props => props.theme.breakpoint}) {
    padding: 5px;
  }
`;

const Nothing = styled.div`
  text-align: center;
  margin-top: 100px;
  opacity: 0.5;
  font-size: 2em;
  @media (${props => props.theme.breakpoint}) {
    font-size: 1.4em;
  }
`;

const Total = styled.div`
  font-weight: bolder;
  font-size: 2em;
  padding: 5px;
  & span {
    font-size: 0.4em;
    text-transform: uppercase;
    font-weight: lighter;
    display: block;
  }
  @media (${props => props.theme.breakpoint}) {
    font-size: 1.2em;
    & span {
      font-size: 0.2em;
    }
  }
`;

const Start = styled(Total)`
  @media (${props => props.theme.breakpoint}) {
    display: none;
  }
`;

const BottomBar = styled.div`
  text-align: right;
`;

const Reset = styled.button`
  font-size: 1.1em;
  border: 0;
  border-radius: 3px;
  background-color: #ff0000;
  padding: 10px 25px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 30px;
  color: white;
  font-weight: bolder;
  cursor: pointer;
  @media (${props => props.theme.breakpoint}) {
    font-size: 1em;
    padding: 8px 15px;
  }
`;
