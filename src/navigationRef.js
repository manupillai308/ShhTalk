import {NavigationActions, StackActions} from 'react-navigation';

let navigator;

export const setNavigator = (nav) => {
    navigator = nav;
};

export const pop = () => {

    const popAction = StackActions.pop({
        n: 1,
      });
    navigator.dispatch(popAction);
}

export const navigate = (routeName, params) => {
    navigator.dispatch(
        NavigationActions.navigate({
            routeName,
            params
        })
    );
};