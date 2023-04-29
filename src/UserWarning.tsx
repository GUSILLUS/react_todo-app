import React, { FormEvent, useState } from 'react';
import classNames from 'classnames';
import { createUser, getUser } from './api/user';
import { User } from './types/User';
import { ErrorMessage } from './types/ErrorMessage';
import { ErrorNotification } from './components/ErrorNotification';

type Props = {
  setUserId: (userId: number) => void,
};

export const UserWarning: React.FC<Props> = ({
  setUserId,
}) => {
  const [mail, setMail] = useState('');
  const [tempMail, setTempMail] = useState('');
  const [hasError, setHasError] = useState<ErrorMessage>(ErrorMessage.NONE);
  const [userName, setUserName] = useState('');
  const [userFindError, setUserFindError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitForm, setIsSubmitForm] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const getData = await getUser(mail);

      if (!getData.length) {
        setUserFindError(true);
        setIsSubmitForm(true);

        throw new Error();
      }

      const user = getData.find(data => {
        return data.email === mail;
      });

      if (user) {
        setUserId(user?.id);
      }
    } catch (e) {
      setHasError(ErrorMessage.LOAD);
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async () => {
    const newUser = {
      username: userName,
      email: mail,
    };

    try {
      await createUser(newUser as User);
    } catch {
      setHasError(ErrorMessage.LOAD);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMail(tempMail);
    addUser();
    fetchUser();
    setIsSubmitForm(false);
  };

  const onCloseError = () => setHasError(ErrorMessage.NONE);

  return (
    <section className="section">
      <form className="box mt-5" onSubmit={handleSubmit}>
        <h1 className="title is-3">
          {(isSubmitForm || userFindError)
            ? 'You need to register'
            : 'Log in to open todos'}
        </h1>
        <div className="control has-icons-left">
          <input
            type="email"
            id="user-email"
            className="input"
            placeholder="Enter your email"
            value={tempMail}
            onChange={(e) => {
              setTempMail(e.target.value);
            }}
            required
          />
          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>

        </div>
        {(isSubmitForm || userFindError) && (
          <div className="field">
            <label className="label" htmlFor="user-name">Your Name</label>
            <div className="control has-icons-left">
              <input
                type="text"
                id="user-name"
                className="input"
                placeholder="Enter your name"
                required
                minLength={4}
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
              <span className="icon is-small is-left">
                <i className="fas fa-user" />
              </span>
            </div>
          </div>
        )}

        <div className="field mt-5">
          <button
            type="submit"
            className={classNames(
              'button is-primary',
              { 'is-loading': isLoading },
            )}
            disabled={!tempMail.trim() || isLoading}
            onClick={() => {
              setMail(tempMail);
            }}
          >
            {(isSubmitForm || userFindError) ? 'Sign up' : 'Login'}
          </button>
        </div>
      </form>

      {hasError && (
        <ErrorNotification
          errorMessage={hasError}
          onCloseError={onCloseError}
        />
      )}
    </section>
  );
};
